'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Logo from './logo';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Logo className="h-20 w-20" />
          </div>
          <DialogTitle className="text-center text-2xl">About OmniTools AI</DialogTitle>
          <DialogDescription asChild>
            <div className="text-center text-muted-foreground pt-4">
                <div className="animated-border-card">
                <ScrollArea className="h-[60vh] p-4 rounded-[6px] bg-background">
                    <div className="space-y-4 text-left">
                        <p>
                            <strong>Omni Tools AI</strong> is an <strong>all-in-one free AI tools platform</strong>, built with a simple mission: to make powerful technology <strong>easy, fast, and accessible for everyone</strong>.
                        </p>
                        <p>
                            “Omni” means <em>everything in one place</em> and that’s exactly what we aim to deliver.
                            From photo enhancement to smart utilities, all tools are available <strong>free of cost</strong>, so anyone can use them without barriers.
                        </p>
                        <p>
                            This platform is <strong>community-driven</strong>.
                            Support and contributions are completely optional and are used only to improve performance, speed, reliability, and to add better tools regularly. Every bit of support helps us keep the platform simple, efficient, and sustainable.
                        </p>
                        <div>
                            Our goal is clear:
                            <ul className="list-disc list-inside pl-4 mt-2">
                                <li>Faster tools</li>
                                <li>Easier experience</li>
                                <li>Reliable daily use</li>
                                <li>Continuous improvement</li>
                            </ul>
                        </div>
                        <p>
                            With your support, Omni Tools AI grows stronger <strong>for everyone, every day</strong>.
                        </p>
                        <p>
                            Thank you for being part of this journey.
                        </p>
                    </div>
                </ScrollArea>
                </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
