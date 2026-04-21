'use client';

import { useState, useTransition, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { BookUser, Pencil, FileText, Image, Languages, CaseUpper, Mic, Code, Video, Bot, Clapperboard, Home, LayoutGrid } from 'lucide-react';

const allTools = [
  { name: 'AI Visa Cover Letter Generator', id: 'visa-builder', icon: BookUser },
  { name: 'AI Social Media Writer', id: 'social-writer', icon: Pencil },
  { name: 'PDF Tools', id: 'pdf-tools', icon: FileText, disabled: true },
  { name: 'AI Image Background Remover', id: 'background-remover', icon: Image },
  { name: 'AI Translation', id: 'translation', icon: Languages },
  { name: 'Text Case Converter', id: 'text-converter', icon: CaseUpper },
  { name: 'Audio Tools', id: 'audio-tools', icon: Mic, disabled: true },
  { name: 'Developer Tools', id: 'dev-tools', icon: Code, disabled: true },
  { name: 'AI Image Generator', id: 'image-generator', icon: Image, disabled: true },
  { name: 'AI Movie Script Writer', id: 'script-writer', icon: Clapperboard, disabled: true },
  { name: 'AI Code Assistant', id: 'code-assistant', icon: Code },
  { name: 'Europass CV Builder', id: 'europass-cv-builder', icon: FileText },
  { name: 'Normal CV Builder', id: 'normal-cv-builder', icon: BookUser },
  { name: 'ATS-Friendly CV Builder', id: 'ats-cv-builder', icon: BookUser },
  { name: 'Photo Enhancer', id: 'photo-enhancer', icon: Image },
  // Add homepage sections to be searchable
  { name: 'Homepage', id: 'home', icon: Home },
  { name: 'Career / CV Section', id: 'career', icon: BookUser },
  { name: 'Photo Editor Section', id: 'photo-editor', icon: Image },
  { name: 'All Tools Section', id: 'tools', icon: LayoutGrid },
];

interface AiToolSuggesterProps {
  onNavigate: (toolId: string) => void;
}

export default function AiToolSuggester({ onNavigate }: AiToolSuggesterProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<(typeof allTools)>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    startTransition(() => {
        const lowercasedInput = inputValue.toLowerCase();
        const filteredTools = allTools.filter(tool => 
            tool.name.toLowerCase().includes(lowercasedInput) && !tool.disabled
        );
        setSuggestions(filteredTools);
    });
  }, [inputValue]);
  
  const handleSuggestionClick = (toolId: string) => {
    onNavigate(toolId);
    setInputValue('');
    setSuggestions([]);
  };

  return (
    <div className="space-y-2 relative">
       <div className="animated-border-card">
          <div className="flex w-full items-center space-x-2 p-2 bg-background/80 rounded-[6px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What do you want to create today? (e.g., Resume, Photo Upscale...)"
                className="pl-10 h-12 text-base bg-background/50"
              />
            </div>
            <Button type="submit" size="lg" disabled={isPending} className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border border-primary h-12">
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                 "Search"
              )}
            </Button>
          </div>
        </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg z-10">
            <div className="p-2 space-y-1">
                {suggestions.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => handleSuggestionClick(tool.id)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
                    >
                        <tool.icon className="h-5 w-5 text-primary" />
                        <span>{tool.name}</span>
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
