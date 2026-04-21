'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Pencil, Image as ImageIcon, Languages, Bot, 
  Code, ArrowRight, LayoutGrid, Video, BookUser, 
  Share2, Facebook, Twitter, Linkedin, 
  MessageSquare, Wrench, Sparkles, Zap, Star,
  Plane, Landmark, Receipt, CaseUpper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { toolCategories, allToolsList, categoryTheme } from '@/lib/tools';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const iconMapping: { [key: string]: React.ElementType } = {
  "नेपाली युटिलिटी हब": Landmark,
  "Career & Professional": BookUser,
  "Visa & Travel Hub": Plane,
  "AI Content & Writing": Pencil,
  "AI Image & Design": ImageIcon,
  "PDF & Media Utils": Wrench,
  "Smart AI Assistants": Bot,
  "Text & Font Stylist": CaseUpper,
};

const defaultFeatured = [
  { name: 'Europass CV', description: 'International Standard Format.', icon: FileText, id: '/cv-builder?type=europass', tag: 'Official', color: 'from-cyan-500/10 to-blue-500/10', iconColor: 'text-blue-500' },
  { name: 'Modern CV', description: 'Stylish & Creative Resumes.', icon: FileText, id: '/cv-builder?type=normal', tag: 'Premium', color: 'from-purple-500/10 to-pink-500/10', iconColor: 'text-purple-500' },
  { name: 'ATS Sharp Builder', description: 'HR Optimized Machine Format.', icon: FileText, id: '/cv-builder?type=ats', tag: 'Verified', color: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-500' },
  { name: 'Dummy Ticket', description: 'Get verifiable flight reservations for visas.', icon: Plane, id: '/dummy-ticket', tag: 'Visa Prep', color: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-500' },
];

const ShareDropdown = ({ tool }: { tool: { name: string; id: string; } }) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    if (!isClient) return null;

    const toolUrl = typeof window !== 'undefined' ? `${window.location.origin}${tool.id}` : '';
    const text = `Check out this awesome tool: ${tool.name} on OmniTools AI!`;

    const socialLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(toolUrl)}&text=${encodeURIComponent(text)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(toolUrl)}&title=${encodeURIComponent(tool.name)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + toolUrl)}`,
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Share2 className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="glass-card border-border">
                <DropdownMenuItem asChild><a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer text-xs"><Facebook className="h-3.5 w-3.5 text-blue-500" /> Facebook</a></DropdownMenuItem>
                <DropdownMenuItem asChild><a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer text-xs"><MessageSquare className="h-3.5 w-3.5 text-green-500" /> WhatsApp</a></DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function ToolsGrid({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [showAllTools, setShowAllTools] = useState(false);
  const firestore = useFirestore();

  const statsQuery = useMemoFirebase(() => query(collection(firestore, 'toolStats'), orderBy('clicks', 'desc'), limit(4)), [firestore]);
  const { data: toolStats } = useCollection(statsQuery);

  const featuredTools = useMemo(() => {
    if (!toolStats || toolStats.length === 0) return defaultFeatured;

    return toolStats.map((stat, i) => {
        const toolData = allToolsList.find(t => t.href === stat.href);
        const colors = [
            'from-cyan-500/10 to-blue-500/10',
            'from-purple-500/10 to-pink-500/10',
            'from-emerald-500/10 to-teal-500/10',
            'from-amber-500/10 to-orange-500/10'
        ];
        
        return {
            name: toolData?.name || stat.id,
            description: toolData?.description || 'Most used tool.',
            icon: toolData?.icon || Zap,
            id: stat.href,
            tag: i === 0 ? 'Trending #1' : 'Popular',
            color: colors[i % colors.length],
            iconColor: toolData?.color || 'text-primary'
        };
    });
  }, [toolStats]);

  const categoriesToDisplay = showAllTools ? Object.entries(toolCategories) : Object.entries(toolCategories).slice(0, 2);

  return (
    <section id="tools" className="w-full py-4">
      <div className="space-y-8">
        {/* Featured Section */}
        <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-1">
                <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2 uppercase italic text-foreground/90">
                    <Zap className="h-4 w-4 text-primary" /> Most Used Power-Tools
                </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {featuredTools.map((tool) => (
                    <div
                        key={tool.id}
                        className="group relative animated-border-card cursor-pointer"
                        onClick={() => onNavigate(tool.id)}
                    >
                        <ShareDropdown tool={{name: tool.name, id: tool.id}} />
                        <Card className={cn("h-full border border-border/50 bg-gradient-to-br transition-all hover:shadow-xl", tool.color)}>
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                <div className="p-2.5 rounded-lg bg-background/80 shadow-inner ring-1 ring-border group-hover:ring-primary/50 transition-all">
                                    <tool.icon className={cn("h-6 w-6 group-hover:scale-110 transition-transform", tool.iconColor)} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight leading-none">{tool.name}</h3>
                                    <p className="text-[9px] text-muted-foreground font-medium leading-tight line-clamp-1">{tool.description}</p>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-0 text-[7px] h-4 px-1.5">{tool.tag}</Badge>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-6">
            <div className="space-y-8">
                {categoriesToDisplay.map(([categoryName, tools]) => {
                    const CategoryIcon = iconMapping[categoryName] || LayoutGrid;
                    const theme = categoryTheme[categoryName] || { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
                    return (
                        <div key={categoryName} className="space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center border", theme.bg, theme.border)}>
                                    <CategoryIcon className={cn("h-3.5 w-3.5", theme.color)} />
                                </div>
                                <h3 className={cn("text-base font-black tracking-tight uppercase italic", theme.color.replace('text-', 'text-'))}>{categoryName}</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {(tools as any[]).map((tool) => (
                                    <div
                                        key={tool.name} 
                                        className="group relative glass-card p-3.5 cursor-pointer flex flex-col items-center text-center gap-2.5 hover:bg-accent/10 transition-all border-border rounded-[1.5rem]"
                                        onClick={() => onNavigate(tool.href)}
                                    >
                                        <ShareDropdown tool={{name: tool.name, id: tool.href}} />
                                        
                                        {tool.tag && (
                                            <Badge className="absolute -top-1 -left-1 bg-accent text-accent-foreground border-0 text-[7px] px-1 h-3.5 shadow-md">{tool.tag}</Badge>
                                        )}
                                        {tool.flag === 'nepal' && (
                                            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5">
                                                <Image src="https://i.imgur.com/dS8Bj8T.png" alt="Nepal" width={14} height={14} className="object-contain" />
                                            </div>
                                        )}

                                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors border shadow-sm", theme.bg, theme.border)}>
                                            {tool.icon ? <tool.icon className={cn("h-4.5 w-4.5 group-hover:scale-110 transition-transform", tool.color)} /> : <LayoutGrid className="h-4.5 w-4.5" />}
                                        </div>
                                        
                                        <div className="space-y-0">
                                            <h4 className="text-[10px] font-bold leading-tight transition-colors uppercase tracking-tight text-foreground">{tool.name}</h4>
                                            <p className="text-[8px] text-muted-foreground font-medium line-clamp-1">{tool.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="text-center pt-2">
                {!showAllTools ? (
                    <Button 
                        variant="outline" 
                        onClick={() => setShowAllTools(true)} 
                        className="border-primary/30 text-primary font-black uppercase tracking-widest hover:bg-primary/10 h-10 px-6 rounded-xl shadow-xl shadow-primary/5 text-[10px]"
                    >
                        View More Categories <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                ) : (
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setShowAllTools(false);
                            const section = document.getElementById('tools');
                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                        }} 
                        className="border-border text-muted-foreground hover:text-foreground h-9 px-5 rounded-xl text-[10px]"
                    >
                        Show Less
                    </Button>
                )}
            </div>
        </div>
      </div>
    </section>
  );
}
