'use client';

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type AvailableDates = { [key: string]: { price: number; currency: string } };

export function DatePicker({ placeholder, date, setDate }: { placeholder: string, date?: Date, setDate: (date?: Date) => void }) {
    const [availableDates, setAvailableDates] = useState<AvailableDates>({});
    const [today, setToday] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        setToday(todayDate);

        const getAvailableDates = () => {
            const dates: AvailableDates = {};
            for (let i = 2; i < 60; i++) {
                const date = addDays(todayDate, i);
                const dateString = format(date, 'yyyy-MM-dd');
                if (Math.random() > 0.3) {
                    dates[dateString] = {
                        price: 100,
                        currency: 'AED'
                    };
                }
            }
            return dates;
        };
        
        setAvailableDates(getAvailableDates());
    }, []);

    if (!today) {
        return <Skeleton className="h-14 w-full" />;
    }

    const formatDay = (day: Date) => {
        const dateString = format(day, "yyyy-MM-dd");
        const availability = availableDates[dateString];
      
        return (
          <div className="relative flex h-full w-full flex-col items-center justify-center p-0 leading-tight -space-y-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full transition-colors">
              {format(day, "d")}
            </div>
            {availability && (
              <div className="absolute -bottom-0.5 text-[8px] font-bold text-primary">
                {availability.price}
              </div>
            )}
          </div>
        );
    };
    
    const handleDateSelect = (selectedDate?: Date) => {
        setDate(selectedDate);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                 <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-left font-normal h-16 bg-background/50 hover:bg-background/80 transition-colors p-3 rounded-lg",
                        !date && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="h-6 w-6 text-primary"/>
                        <div className="flex flex-col">
                             <span className="text-sm font-semibold text-muted-foreground">{placeholder}</span>
                             <span className="text-lg font-bold">
                                {date ? format(date, "PPP") : "Select date"}
                             </span>
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={[{ before: today }, (day) => !availableDates[format(day, 'yyyy-MM-dd')]]}
                    formatters={{
                        formatDay,
                    }}
                    modifiersClassNames={{
                        selected: '[&>div>div:first-child]:bg-primary [&>div>div:first-child]:text-primary-foreground [&>div>div:last-child]:text-primary-foreground',
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
