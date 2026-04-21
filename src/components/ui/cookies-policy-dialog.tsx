'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

interface CookiesPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiesPolicyDialog({ open, onOpenChange }: CookiesPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Cookie Policy</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            Last Updated: December 15, 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-6 border rounded-md bg-background/50">
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <h3 className="font-semibold text-foreground">1. What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device (computer, tablet, mobile) when you visit certain websites. They are used to 'remember' you and your preferences, either for a single visit (through a 'session cookie') or for multiple repeat visits (using a 'persistent cookie').
            </p>
            <h3 className="font-semibold text-foreground">2. How We Use Cookies</h3>
            <p>
              At OmniTools AI, we use cookies for essential functionalities and to improve your experience. Our use is limited to:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly. For example, they help maintain your session when you are logged in.</li>
              <li><strong>Preference Cookies:</strong> These cookies are used to store your preferences, such as your preferred theme (Light/Dark Mode) or language settings, so you don’t have to set them on every visit.</li>
              <li><strong>Analytics Cookies:</strong> We use Google Analytics to collect anonymous data about how visitors use our site. This helps us understand which tools are popular and how we can improve our services. This data is aggregated and does not personally identify you.</li>
            </ul>
            <h3 className="font-semibold text-foreground">3. We Do Not Use Cookies For:</h3>
             <ul>
                <li><strong>Advertising:</strong> We do not use third-party advertising cookies to track your browsing habits or show you targeted ads.</li>
                <li><strong>Selling Data:</strong> We never sell any data collected through cookies to third parties.</li>
            </ul>
            <h3 className="font-semibold text-foreground">4. Managing Cookies</h3>
            <p>
              You have the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. However, please note that disabling essential cookies may impact the functionality of our website.
            </p>
            <h3 className="font-semibold text-foreground">5. Consent</h3>
            <p>
              By using our website, you consent to the use of cookies in accordance with this Cookie Policy.
            </p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
