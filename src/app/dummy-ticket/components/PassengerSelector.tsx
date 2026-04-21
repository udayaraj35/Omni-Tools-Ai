'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Users, Plus, Minus, ChevronsUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PassengerSelectorProps {
    adults: number;
    children: number;
    infants: number;
    onPassengerChange: (type: 'adults' | 'children' | 'infants', value: number) => void;
}


export function PassengerSelector({ adults, children, infants, onPassengerChange }: PassengerSelectorProps) {
    const totalPassengers = adults + children + infants;

    const PassengerCounter = ({ label, value, onDecrement, onIncrement, note }: { label: string, value: number, onDecrement: () => void, onIncrement: () => void, note?: string }) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium">{label}</p>
                {note && <p className="text-xs text-muted-foreground">{note}</p>}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onDecrement} disabled={value === (label === 'Adults' ? 1 : 0)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold">{value}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onIncrement}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-between h-16 text-left font-normal bg-background/50 hover:bg-background/80 transition-colors p-3 rounded-lg"
                >
                    <div className="flex items-center gap-3">
                         <Users className="h-6 w-6 text-primary"/>
                        <div className="flex flex-col">
                             <span className="text-sm font-semibold text-muted-foreground">Passengers</span>
                             <span className="text-lg font-bold">{totalPassengers} traveler{totalPassengers > 1 && 's'}</span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4 space-y-4">
                <PassengerCounter label="Adults" value={adults} onDecrement={() => onPassengerChange('adults', Math.max(1, adults - 1))} onIncrement={() => onPassengerChange('adults', adults + 1)} note="12+ years" />
                <Separator />
                <PassengerCounter label="Children" value={children} onDecrement={() => onPassengerChange('children', Math.max(0, children - 1))} onIncrement={() => onPassengerChange('children', children + 1)} note="2-12 years" />
                <Separator />
                <PassengerCounter label="Infants" value={infants} onDecrement={() => onPassengerChange('infants', Math.max(0, infants - 1))} onIncrement={() => onPassengerChange('infants', infants + 1)} note="under 2 years" />
            </PopoverContent>
        </Popover>
    );
}
