'use client';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Download, Trash2, Coffee, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextCaseConverterProps {
  onTaskComplete: () => void;
}

type CaseType =
  | 'sentence'
  | 'lower'
  | 'upper'
  | 'capitalized'
  | 'alternating'
  | 'title'
  | 'inverse';

export function TextCaseConverter({ onTaskComplete }: TextCaseConverterProps) {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
  });
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const sentences = text.match(/[^.!?]+[.!?]+/g)?.length || 0;
    const lines = text.split('\n').length;
    setStats({ characters, words, sentences, lines });
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const convertCase = (type: CaseType) => {
    let newText = '';
    switch (type) {
      case 'sentence':
        newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
        break;
      case 'lower':
        newText = text.toLowerCase();
        break;
      case 'upper':
        newText = text.toUpperCase();
        break;
      case 'capitalized':
        newText = text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'alternating':
        newText = text.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');
        break;
      case 'title':
        newText = text.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
        break;
      case 'inverse':
        newText = text.split('').map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
        break;
    }
    setText(newText);
    toast({ title: `Converted to ${type.replace('-', ' ')} case!` });
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
    toast({ title: 'Text cleared!' });
  };
  
  const caseButtons: { type: CaseType; label: string; style?: React.CSSProperties }[] = [
      { type: 'sentence', label: 'Sentence case' },
      { type: 'lower', label: 'lower case' },
      { type: 'upper', label: 'UPPER CASE' },
      { type: 'capitalized', label: 'Capitalized Case' },
      { type: 'alternating', label: 'aLtErNaTiNg cAsE' },
      { type: 'title', label: 'Title Case' },
      { type: 'inverse', label: 'InVeRsE CaSe' },
  ];

  return (
    <div className="w-full">
      <Card className="glass-card">
        <CardContent className="p-4 md:p-6">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Type or paste your text here..."
            className="h-64 text-base bg-background/50 border-2 border-dashed"
          />
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {caseButtons.map(({ type, label }) => (
              <Button key={type} variant="outline" size="sm" onClick={() => convertCase(type)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
            <Button onClick={handleCopy} className="gradient-button-gold">
                {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                Copy to Clipboard
            </Button>
            <Button onClick={handleDownload} className="gradient-button-gold"><Download className="mr-2 h-4 w-4" /> Download Text</Button>
            <Button onClick={handleClear} variant="destructive" className="bg-red-800/80 hover:bg-red-800"><Trash2 className="mr-2 h-4 w-4" /> Clear</Button>
            <button onClick={onTaskComplete} className={cn('h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium', 'btn-bmac')}>
              <Coffee className="mr-2 h-4 w-4"/> Buy me a Coffee
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 justify-center text-muted-foreground">
        <p><strong>{stats.characters}</strong> Characters</p>
        <p><strong>{stats.words}</strong> Words</p>
        <p><strong>{stats.sentences}</strong> Sentences</p>
        <p><strong>{stats.lines}</strong> Lines</p>
      </div>
    </div>
  );
}
