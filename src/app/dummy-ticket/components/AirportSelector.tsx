
'use client';
import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { PlaneTakeoff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { airports } from '@/lib/airports';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AirportSelectorProps {
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
    country?: string;
}

export function AirportSelector({ placeholder, value, onValueChange, country }: AirportSelectorProps) {
    const sortedAirports = useMemo(() => {
        return [...airports].sort((a, b) => a.city.localeCompare(b.city));
    }, []);

    const filteredAirports = useMemo(() => {
        if (!country || country === 'Other') return sortedAirports;
        return sortedAirports.filter(airport => airport.country.toLowerCase() === country.toLowerCase());
    }, [country, sortedAirports]);

    const otherAirports = useMemo(() => {
        if (!country || country === 'Other') return [];
        return sortedAirports.filter(airport => airport.country.toLowerCase() !== country.toLowerCase());
    }, [country, sortedAirports]);

    const selectedAirport = useMemo(() => {
        if (value === 'Other') return { code: 'Other', city: 'Manual' };
        return airports.find(airport => airport.code.toLowerCase() === value.toLowerCase());
    }, [value]);

    return (
        <div className="space-y-1">
            <Select onValueChange={onValueChange} value={value}>
                <SelectTrigger className="w-full h-16 text-left font-normal bg-background/50 hover:bg-background/80 transition-colors p-3 rounded-lg border-0 shadow-none focus:ring-0">
                    <div className="flex items-center gap-3">
                        <PlaneTakeoff className="h-6 w-6 text-primary"/>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-muted-foreground">{placeholder}</span>
                            <span className={cn("text-lg font-bold truncate", !value && "text-muted-foreground")}>
                                {selectedAirport ? `${selectedAirport.city} (${selectedAirport.code})` : `Select airport`}
                            </span>
                        </div>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <ScrollArea className="h-[300px]">
                        {filteredAirports.length > 0 && (
                            <SelectGroup>
                                <SelectLabel>{country && country !== 'Other' ? `Airports in ${country}` : "Main Airports"}</SelectLabel>
                                {filteredAirports.map(airport => (
                                    <SelectItem key={airport.code} value={airport.code.toLowerCase()}>
                                        <div className="flex flex-col">
                                            <span>{airport.city} ({airport.code})</span>
                                            <span className="text-[10px] opacity-70">{airport.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        )}
                        {otherAirports.length > 0 && (
                            <SelectGroup>
                                <SelectLabel>Other World Airports</SelectLabel>
                                {otherAirports.map(airport => (
                                    <SelectItem key={airport.code} value={airport.code.toLowerCase()}>
                                        <div className="flex flex-col">
                                            <span>{airport.city} ({airport.code})</span>
                                            <span className="text-[10px] opacity-70">{airport.country}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        )}
                        <SelectItem value="Other">Other (Manual Input)</SelectItem>
                    </ScrollArea>
                </SelectContent>
            </Select>
        </div>
    );
}
