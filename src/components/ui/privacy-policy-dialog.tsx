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

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Privacy Policy for OmniTools AI</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            Last Updated: December 15, 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-6 border rounded-md bg-background/50">
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <h3 className="font-semibold text-foreground">1. Introduction</h3>
            <p>
              Welcome to OmniTools AI. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website, including our Europass CV Builder, AI Photo Enhancer, and other online tools.
            </p>
            <h3 className="font-semibold text-foreground">2. Information We Collect</h3>
            <p>
              We collect information only necessary to provide our services:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, phone number, and employment history that you voluntarily input when using the CV and Cover Letter Builder.</li>
              <li><strong>Uploaded Content:</strong> Images, videos, and documents that you upload for editing, upscaling (8K), or format conversion.</li>
              <li><strong>Usage Data:</strong> Basic information about how you access our site (e.g., browser type, device type) to improve user experience.</li>
            </ul>
            <h3 className="font-semibold text-foreground">3. How We Use Your Information</h3>
            <p>
              We use your data strictly for the following purposes:
            </p>
            <ul>
                <li>To generate your CVs, resumes, and cover letters as per your request.</li>
                <li>To process, edit, and upscale your uploaded photos and videos using AI technology.</li>
                <li>To improve the functionality and performance of our tools.</li>
            </ul>
            <h3 className="font-semibold text-foreground">4. Data Retention and Security (Important)</h3>
            <p>
              We value your trust. Here is how we handle your files:
            </p>
            <ul>
                <li><strong>Automatic Deletion:</strong> All photos, videos, and documents uploaded to OmniTools AI are automatically deleted from our servers within 24 hours after processing. We do not store your personal files permanently.</li>
                <li><strong>No Ownership:</strong> We do not claim ownership of the content you create or upload. Your CVs and photos belong to you.</li>
                <li><strong>Security:</strong> We use standard SSL encryption to protect your data during transmission.</li>
            </ul>
            <h3 className="font-semibold text-foreground">5. Sharing of Information</h3>
            <p>
                We do not sell, trade, or rent your personal identification information to others.
            </p>
            <ul>
                <li><strong>AI Service Providers:</strong> Since we use advanced AI for photo upscaling and text generation, your data is processed through secure AI APIs solely for the purpose of completing your task. These providers are not authorized to use your data for other purposes.</li>
            </ul>
            <h3 className="font-semibold text-foreground">6. Cookies</h3>
            <p>
                We use standard cookies to ensure the website functions correctly and to save your preferences (like Dark Mode or Language settings). You can choose to disable cookies through your browser settings.
            </p>
            <h3 className="font-semibold text-foreground">7. Changes to This Policy</h3>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.
            </p>
            <h3 className="font-semibold text-foreground">8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
                <li>Email: omnitoolsai@gmail.com</li>
                <li>Website: www.omnitoolsai.fun</li>
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
