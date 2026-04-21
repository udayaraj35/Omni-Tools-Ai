
'use client';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { worldCountries, euCountries } from '@/lib/cities';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CountrySelectorProps {
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
}

export function CountrySelector({ placeholder, value, onValueChange }: CountrySelectorProps) {
    const restOfTheWorld = worldCountries.filter(c => !euCountries.includes(c));

    return (
        <div className="space-y-1">
            <Select onValueChange={onValueChange} value={value}>
                <SelectTrigger className="w-full h-16 text-left font-normal bg-background/50 hover:bg-background/80 transition-colors p-3 rounded-lg border-0 shadow-none focus:ring-0">
                    <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-primary"/>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-muted-foreground">{placeholder}</span>
                            <span className={cn("text-lg font-bold truncate", !value && "text-muted-foreground")}>
                                {value || 'Select a country'}
                            </span>
                        </div>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <ScrollArea className="h-[300px]">
                        <SelectGroup>
                            <SelectLabel>Europe</SelectLabel>
                            {euCountries.map(country => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Rest of the World</SelectLabel>
                            {restOfTheWorld.map(country => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectItem value="Other">Other (Manual Input)</SelectItem>
                    </ScrollArea>
                </SelectContent>
            </Select>
        </div>
    );
}
