'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export function ComingSoon() {
    return (
        <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Coming Soon!</h3>
                <p className="text-muted-foreground mt-2">This tool is under construction. We're working hard to bring it to you.</p>
            </CardContent>
        </Card>
    );
}
