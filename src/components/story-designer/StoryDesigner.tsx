'use client';

/**
 * @fileOverview Advanced Ultra-HD A4 PDF Editor
 * Features: High-DPI Rendering, Click-to-Edit, Smart Masking, Full-page Workspace.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
    Upload, Download, Plus, Trash2, Undo, Redo, 
    ZoomIn, ZoomOut, FileText, 
    Type, Wand2, Loader2, ChevronLeft, ChevronRight,
    Type as TypeIcon, Palette, X, Settings2, MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// PDF.js Worker setup for Next.js
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
}

const A4_WIDTH = 800; // Base layout width
const A4_HEIGHT = Math.round(A4_WIDTH * 297 / 210); // Standard A4 ratio
const RENDER_SCALE = 3.0; // High quality rendering scale (3x DPI)

interface PageData {
    backgroundUrl: string;
    objectsJSON: any;
    originalWidth: number;
    originalHeight: number;
}

export function StoryDesigner() {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(0.8);
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

    // Initialize Fabric Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: A4_WIDTH,
            height: A4_HEIGHT,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });

        // Click-to-Edit Logic
        canvas.on('mouse:up', (e) => {
            if (e.target) {
                setSelectedObject(e.target);
                // If text is clicked, enter edit mode immediately
                if (e.target.type === 'textbox' && !e.target.isEditing) {
                    setTimeout(() => {
                        const t = e.target as fabric.Textbox;
                        if (t && !t.isEditing) {
                            t.enterEditing();
                            t.selectAll();
                            canvas.renderAll();
                        }
                    }, 50);
                }
            } else {
                setSelectedObject(null);
            }
        });

        canvas.on('object:modified', () => saveState(canvas));
        canvas.on('object:added', () => {
            if (!(canvas as any).isInternalLoading) saveState(canvas);
        });
        canvas.on('object:removed', () => saveState(canvas));

        fabricRef.current = canvas;
        return () => { canvas.dispose(); };
    }, []);

    const saveState = (canvas: fabric.Canvas) => {
        const json = JSON.stringify(canvas.toJSON(['isOriginal']));
        setUndoStack(prev => [...prev.slice(-49), json]);
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (undoStack.length <= 1 || !fabricRef.current) return;
        const current = undoStack.pop();
        if (!current) return;
        setRedoStack(prev => [...prev, current]);
        const prev = undoStack[undoStack.length - 1];
        (fabricRef.current as any).isInternalLoading = true;
        fabricRef.current.loadFromJSON(prev, () => {
            fabricRef.current?.renderAll();
            (fabricRef.current as any).isInternalLoading = false;
        });
    };

    const handleRedo = () => {
        if (redoStack.length === 0 || !fabricRef.current) return;
        const next = redoStack.pop();
        if (!next) return;
        setUndoStack(prev => [...prev, next]);
        (fabricRef.current as any).isInternalLoading = true;
        fabricRef.current.loadFromJSON(next, () => {
            fabricRef.current?.renderAll();
            (fabricRef.current as any).isInternalLoading = false;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') return;

        setIsLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            setOriginalBytes(new Uint8Array(arrayBuffer));
            const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(doc);

            const pagesArray: PageData[] = [];
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                // Low-res background for sidebar
                const vp = page.getViewport({ scale: 0.2 });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width;
                canvas.height = vp.height;
                await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
                
                const originalVp = page.getViewport({ scale: 1.0 });
                pagesArray.push({ 
                    backgroundUrl: canvas.toDataURL(), 
                    objectsJSON: null,
                    originalWidth: originalVp.width,
                    originalHeight: originalVp.height
                });
            }
            setPages(pagesArray);
            await loadPage(0, doc, pagesArray);
            toast({ title: "High-Resolution PDF Loaded!", description: "Click the Magic Wand to start editing text." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error loading PDF" });
        } finally {
            setIsLoading(false);
        }
    };

    const loadPage = async (index: number, docSource = pdfDoc, pagesSource = pages) => {
        if (!fabricRef.current || !docSource) return;
        
        // Save current page state before switching
        if (pages[currentPage]) {
            pages[currentPage].objectsJSON = fabricRef.current.toJSON(['isOriginal']);
        }

        const canvas = fabricRef.current;
        canvas.clear();
        setCurrentPage(index);

        const page = await docSource.getPage(index + 1);
        // Ultra-HD background for canvas
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const offscreen = document.createElement('canvas');
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        await page.render({ canvasContext: offscreen.getContext('2d')!, viewport }).promise;

        fabric.Image.fromURL(offscreen.toDataURL(), (img) => {
            const scale = Math.min(A4_WIDTH / img.width!, A4_HEIGHT / img.height!);
            img.scale(scale);
            img.set({ 
                left: (A4_WIDTH - img.width! * scale) / 2, 
                top: (A4_HEIGHT - img.height! * scale) / 2, 
                selectable: false, 
                evented: false 
            });
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            
            if (pagesSource[index].objectsJSON) {
                (canvas as any).isInternalLoading = true;
                canvas.loadFromJSON(pagesSource[index].objectsJSON, () => {
                    canvas.renderAll();
                    (canvas as any).isInternalLoading = false;
                    setUndoStack([JSON.stringify(canvas.toJSON(['isOriginal']))]);
                });
            } else {
                setUndoStack([JSON.stringify(canvas.toJSON(['isOriginal']))]);
            }
        });
    };

    const extractText = async () => {
        if (!pdfDoc || !fabricRef.current) return;
        setIsLoading(true);
        const canvas = fabricRef.current;
        try {
            const page = await pdfDoc.getPage(currentPage + 1);
            const textContent = await page.getTextContent();
            const vp = page.getViewport({ scale: 1.0 });
            
            const bg = canvas.backgroundImage as fabric.Image;
            const scaleX = bg.scaleX!;
            const scaleY = bg.scaleY!;
            const offsetX = bg.left!;
            const offsetY = bg.top!;

            textContent.items.forEach((item: any) => {
                const tx = item.transform[4];
                const ty = item.transform[5];
                const h = item.height || 12;
                
                // Mapped Coordinates
                const left = offsetX + (tx / vp.width) * (bg.width! * scaleX);
                const top = offsetY + ((vp.height - ty - h) / vp.height) * (bg.height! * scaleY);

                const textbox = new fabric.Textbox(item.str, {
                    left, top,
                    width: (item.width / vp.width) * (bg.width! * scaleX) + 10,
                    fontSize: (h / vp.height) * (bg.height! * scaleY),
                    fontFamily: 'Arial',
                    fill: '#000000',
                    backgroundColor: 'rgba(255,255,255,0.95)', // Masking original text
                    borderColor: '#2563eb',
                    cornerColor: '#2563eb',
                    transparentCorners: false,
                    // @ts-ignore
                    isOriginal: true,
                    editable: true
                });
                canvas.add(textbox);
            });
            canvas.renderAll();
            saveState(canvas);
            toast({ title: "Smart Extraction Successful!", description: "Every line is now a sharp editable box." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Extraction Failed" });
        } finally {
            setIsLoading(false);
        }
    };

    const addText = () => {
        if (!fabricRef.current) return;
        const t = new fabric.Textbox('Double Click to Edit', {
            left: A4_WIDTH / 2 - 100, top: 200, width: 200, fontSize: 24, 
            fontFamily: 'Arial', fill: '#000000',
            borderColor: '#2563eb', cornerColor: '#2563eb'
        });
        fabricRef.current.add(t);
        fabricRef.current.setActiveObject(t);
        saveState(fabricRef.current);
    };

    const handleSave = async () => {
        if (!originalBytes || !fabricRef.current) return;
        setIsLoading(true);
        try {
            const pdfDocLib = await PDFDocument.load(originalBytes);
            const standardFont = await pdfDocLib.embedFont(StandardFonts.Helvetica);

            for (let i = 0; i < pages.length; i++) {
                const page = pdfDocLib.getPage(i);
                const objects = i === currentPage ? fabricRef.current.getObjects() : (pages[i].objectsJSON?.objects || []);
                const pw = page.getWidth();
                const ph = page.getHeight();
                
                const bg = fabricRef.current.backgroundImage as fabric.Image;
                const canvasW = bg.width! * bg.scaleX!;
                const canvasH = bg.height! * bg.scaleY!;
                const offsetX = bg.left!;
                const offsetY = bg.top!;

                const sx = pw / canvasW;
                const sy = ph / canvasH;

                for (const obj of objects) {
                    if (obj.type === 'textbox') {
                        const t = obj as fabric.Textbox;
                        const relX = (t.left! - offsetX) * sx;
                        const relY = ph - (t.top! - offsetY + (t.height! * 0.8)) * sy;

                        // Perform High-Precision Masking
                        // @ts-ignore
                        if (t.isOriginal) {
                            page.drawRectangle({
                                x: (t.left! - offsetX) * sx, 
                                y: ph - (t.top! - offsetY + t.height!) * sy,
                                width: t.width! * sx, 
                                height: t.height! * sy, 
                                color: rgb(1, 1, 1)
                            });
                        }
                        
                        page.drawText(t.text || '', {
                            x: relX, 
                            y: relY,
                            size: t.fontSize! * sy, 
                            font: standardFont, 
                            color: rgb(0, 0, 0)
                        });
                    }
                }
            }
            const bytes = await pdfDocLib.save();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
            link.download = `Studio_Sharp_PDF_${Date.now()}.pdf`;
            link.click();
            toast({ title: "Smart PDF Exported!", description: "Your file is ready at high quality." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Save Failed" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
        <div className="relative w-full h-[90vh] flex bg-[#050508] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            
            {/* 1. SLIM PAGE EXPLORER */}
            {pages.length > 0 && (
                <div className="w-24 border-r border-white/5 bg-black/40 flex flex-col py-24 gap-6 overflow-y-auto custom-scrollbar backdrop-blur-3xl z-20">
                    {pages.map((p, i) => (
                        <div key={i} onClick={() => loadPage(i)} className={cn("relative cursor-pointer transition-all mx-3 rounded-xl overflow-hidden border-2", currentPage === i ? "border-primary scale-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "border-transparent opacity-30 hover:opacity-100")}>
                            <img src={p.backgroundUrl} alt={`Page ${i+1}`} className="w-full" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-black text-white">{i+1}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. MAIN STAGE */}
            <div className="flex-grow flex flex-col relative">
                
                {/* FLOATING ACTION HUB */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 bg-zinc-900/90 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl">
                    {!pdfDoc ? (
                        <div className="relative overflow-hidden">
                            <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-[0.2em] gap-3 h-14 px-10 hover:bg-white/5 group">
                                <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" /> Load Source PDF
                            </Button>
                            <input ref={fileInputRef} type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={extractText} className="text-white hover:text-primary h-12 w-12"><Wand2 className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>Smart Extract All Text</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={addText} className="text-white hover:text-primary h-12 w-12"><Type className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>New Text Block</TooltipContent></Tooltip>
                            <div className="w-px h-10 bg-white/10 mx-2" />
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleUndo} disabled={undoStack.length <= 1} className="text-zinc-500 hover:text-white h-12 w-12"><Undo className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleRedo} disabled={redoStack.length === 0} className="text-zinc-500 hover:text-white h-12 w-12"><Redo className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
                            <div className="w-px h-10 bg-white/10 mx-2" />
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="text-zinc-500 hover:text-white h-12 w-12"><ZoomOut className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>Zoom Out</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-zinc-500 hover:text-white h-12 w-12"><ZoomIn className="w-6 h-6"/></Button></TooltipTrigger><TooltipContent>Zoom In</TooltipContent></Tooltip>
                            <div className="w-px h-10 bg-white/10 mx-2" />
                            <Button onClick={handleSave} className="ml-3 gradient-button-gold rounded-xl h-14 px-10 font-black uppercase text-xs tracking-[0.2em] shadow-xl">
                                <Download className="w-5 h-5 mr-3" /> Export HD PDF
                            </Button>
                        </div>
                    )}
                </div>

                {/* WORKSPACE */}
                <div className="flex-grow flex justify-center items-start pt-32 overflow-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    <div 
                        className="shadow-[0_80px_150px_rgba(0,0,0,1)] rounded-sm overflow-hidden bg-white origin-top transition-transform duration-200 mb-20 ring-1 ring-white/10"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                    
                    {!pdfDoc && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5 pointer-events-none">
                            <FileText className="w-80 h-80 text-white" />
                            <p className="text-4xl font-black uppercase tracking-[1em] mt-8">Studio Inactive</p>
                        </div>
                    )}
                </div>

                {/* PAGE NAVIGATION HUD */}
                {pdfDoc && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 px-10 py-5 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl">
                        <Button variant="ghost" size="icon" disabled={currentPage === 0} onClick={() => loadPage(currentPage - 1)} className="h-12 w-12 text-white hover:bg-white/10"><ChevronLeft className="w-6 h-6"/></Button>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-1">Navigation</span>
                            <span className="text-sm font-black text-white">PAGE {currentPage + 1} / {pages.length}</span>
                        </div>
                        <Button variant="ghost" size="icon" disabled={currentPage === pages.length - 1} onClick={() => loadPage(currentPage + 1)} className="h-12 w-12 text-white hover:bg-white/10"><ChevronRight className="w-6 h-6"/></Button>
                    </div>
                )}
            </div>

            {/* 3. QUICK PROPERTIES SIDEBAR */}
            {selectedObject && (
                <div className="w-80 border-l border-white/5 bg-zinc-950/90 p-8 flex flex-col gap-8 backdrop-blur-3xl z-30 animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-4 h-4 text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Object Studio</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => fabricRef.current?.discardActiveObject().renderAll()}><X className="w-5 h-5"/></Button>
                    </div>

                    {selectedObject.type === 'textbox' && (
                        <div className="space-y-8 text-left">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><TypeIcon className="w-3 h-3"/> Content</Label>
                                <Textarea 
                                    className="bg-zinc-900 border-white/10 min-h-[120px] rounded-xl text-xs leading-relaxed" 
                                    value={(selectedObject as fabric.Textbox).text} 
                                    onChange={(e) => {
                                        (selectedObject as fabric.Textbox).set('text', e.target.value);
                                        fabricRef.current?.renderAll();
                                    }}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                    <span>Font Size</span>
                                    <span className="text-primary font-black">{(selectedObject as fabric.Textbox).fontSize}px</span>
                                </div>
                                <Slider 
                                    value={[(selectedObject as fabric.Textbox).fontSize || 12]} 
                                    onValueChange={(v) => {
                                        (selectedObject as fabric.Textbox).set('fontSize', v[0]);
                                        fabricRef.current?.renderAll();
                                    }} 
                                    min={6} max={120} step={1}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Palette className="w-3 h-3"/> Appearance</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Input 
                                            type="color" 
                                            className="w-full h-12 p-1 bg-zinc-900 border-white/10 rounded-xl cursor-pointer" 
                                            value={(selectedObject as fabric.Textbox).fill as string} 
                                            onChange={(e) => {
                                                (selectedObject as fabric.Textbox).set('fill', e.target.value);
                                                fabricRef.current?.renderAll();
                                            }}
                                        />
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-difference">
                                            <span className="text-[8px] font-black uppercase text-white">Color</span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="h-12 bg-zinc-900 border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                                        onClick={() => {
                                            const align = (selectedObject as fabric.Textbox).textAlign;
                                            const next = align === 'left' ? 'center' : align === 'center' ? 'right' : 'left';
                                            (selectedObject as fabric.Textbox).set('textAlign', next);
                                            fabricRef.current?.renderAll();
                                        }}
                                    >
                                        <TypeIcon className="w-3 h-3" /> Align
                                    </Button>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <Button 
                                variant="destructive" 
                                className="w-full h-14 uppercase font-black text-[10px] tracking-[0.2em] gap-3 rounded-2xl shadow-lg"
                                onClick={() => {
                                    fabricRef.current?.remove(selectedObject);
                                    setSelectedObject(null);
                                }}
                            >
                                <Trash2 className="w-5 h-5" /> Delete Element
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* HIGH-RES LOADING OVERLAY */}
            {isLoading && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
                    <div className="relative">
                        <Loader2 className="w-32 h-32 animate-spin text-primary opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center mt-10 space-y-3">
                        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-primary italic animate-pulse">Ultra-HD Engine Rendering...</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Applying High-DPI Text Processing</p>
                    </div>
                </div>
            )}
        </div>
        </TooltipProvider>
    );
}
