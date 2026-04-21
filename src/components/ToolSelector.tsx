'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, BookUser } from 'lucide-react';

export type ToolType = "cv-builder" | "cover-letter";

const tools: { value: ToolType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'cv-builder', label: 'Europass CV Builder', icon: FileText },
  { value: 'cover-letter', label: 'Cover Letter Builder', icon: BookUser },
];

interface ToolSelectorProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

export function ToolSelector({ activeTool, onToolChange }: ToolSelectorProps) {
  const activeToolData = tools.find(t => t.value === activeTool);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-glow-primary flex-1">
        {activeToolData?.label || "Select a Tool"}
      </h1>
      <div className="w-full sm:w-64">
        <Select value={activeTool} onValueChange={onToolChange}>
          <SelectTrigger className="w-full h-11">
            <div className="flex items-center gap-2">
              {activeToolData && <activeToolData.icon className="w-5 h-5" />}
              <SelectValue placeholder="Select a tool" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {tools.map((tool) => (
              <SelectItem key={tool.value} value={tool.value}>
                <div className="flex items-center gap-2">
                  <tool.icon className="w-5 h-5 text-muted-foreground" />
                  <span>{tool.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
