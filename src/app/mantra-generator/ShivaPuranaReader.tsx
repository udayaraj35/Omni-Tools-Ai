'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Download, Link as LinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function ShivaPuranaReader({ onBack }: { onBack: () => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold devanagari" style={{color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.7)'}}>ॐ नमः शिवाय</h1>
            <CardTitle className="text-2xl font-bold devanagari mt-2">शिव महापुराण - पूर्ण संग्रह</CardTitle>
            <CardDescription>४५७ अध्याय | ७ संहिता | Page-by-page links</CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Library</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          {/* Nepali Section */}
          <Accordion type="single" collapsible defaultValue="nepali" className="border border-amber-800/30 rounded-lg overflow-hidden">
            <AccordionItem value="nepali" className="border-b-0">
              <AccordionTrigger className="text-xl font-semibold px-6 py-4 bg-amber-900/20 hover:no-underline">नेपाली संस्करण (पूर्ण PDF)</AccordionTrigger>
              <AccordionContent className="p-6 space-y-3">
                <p><strong>पूर्ण नेपाली अनुवाद (२ भाग):</strong></p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://archive.org/details/2_20201208_20201208_1659" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full justify-start gap-2 h-12 text-base"><Download /> Shiv Puran Nepali भाग २ (PDF)</Button>
                  </a>
                  <a href="https://www.scribd.com/document/402111643/001-Shiv-Puran-Nepali-pdf" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full justify-start gap-2 h-12 text-base"><LinkIcon /> Shiv Puran Nepali भाग १ (Scribd)</Button>
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">यी लिङ्कहरूले तपाईंलाई PDF फाइलहरूमा लैजान्छन् जहाँ तपाईं पूर्ण किताब पढ्न वा डाउनलोड गर्न सक्नुहुन्छ।</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Hindi Section */}
          <Accordion type="single" collapsible className="border border-amber-800/30 rounded-lg overflow-hidden">
            <AccordionItem value="hindi" className="border-b-0">
              <AccordionTrigger className="text-xl font-semibold px-6 py-4 bg-amber-900/20 hover:no-underline">हिंदी संस्करण (Gita Press पूर्ण)</AccordionTrigger>
              <AccordionContent className="p-6 space-y-3">
                <a href="https://archive.org/details/SHIVPURANHINDI" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto justify-start gap-2 h-12 text-base"><Download /> Gita Press शिव पुराण हिंदी - पूर्ण किताब (PDF)</Button>
                </a>
                <p className="text-sm text-muted-foreground">यो Gita Press द्वारा प्रकाशित पूर्ण स्क्यान गरिएको पुस्तक हो।</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* English Section */}
          <div className="border border-amber-800/30 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 px-2">English Complete Translation (wisdomlib.org)</h2>
            <Accordion type="multiple" className="w-full space-y-2">
              <AccordionItem value="mahatmya" className="bg-muted/20 rounded-lg border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">Śivapurāṇa-māhātmya (7 Chapters)</AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <p className="mb-2 text-sm">Greatness of Śivapurāṇa, stories of liberation, etc.</p>
                  <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc225534.html" target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="p-0 h-auto"><BookOpen className="mr-2 h-4 w-4"/>Read Full Mahatmya</Button>
                  </a>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="vidyeshvara" className="bg-muted/20 rounded-lg border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">1. Vidyeśvara Saṃhitā (25 Chapters)</AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                    <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc225543.html" target="_blank" rel="noopener noreferrer">
                        <Button variant="link" className="p-0 h-auto"><BookOpen className="mr-2 h-4 w-4"/>Read all 25 chapters</Button>
                    </a>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rudra" className="bg-muted/20 rounded-lg border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">2. Rudra Saṃhitā (197 Chapters)</AccordionTrigger>
                <AccordionContent className="px-4 pb-3 space-y-2">
                    <p><strong>2.1 Sṛṣṭi-khaṇḍa (20 chapters)</strong> - <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc225966.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read Section</a></p>
                    <p><strong>2.2 Satī-khaṇḍa (43 chapters)</strong> - <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226019.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read Section</a></p>
                    <p><strong>2.3 Pārvatī-khaṇḍa (55 chapters)</strong> - <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226064.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read Section</a></p>
                    <p><strong>2.4 Kumāra-khaṇḍa (20 chapters)</strong> - <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226120.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read Section</a></p>
                    <p><strong>2.5 Yuddha-khaṇḍa (59 chapters)</strong> - <a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226141.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read Section</a></p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="other-samhitas" className="bg-muted/20 rounded-lg border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">3-7. Other Saṃhitās</AccordionTrigger>
                <AccordionContent className="px-4 pb-3 space-y-2">
                  <p><a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226396.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">3. Śatarudra-saṃhitā (42 chapters)</a></p>
                  <p><a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226439.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">4. Koṭirudra-saṃhitā (43 chapters)</a></p>
                  <p><a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226545.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">5. Umā-saṃhitā (51 chapters)</a></p>
                  <p><a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226612.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">6. Kailāsa-saṃhitā (23 chapters)</a></p>
                  <p><a href="https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226636.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">7. Vāyavīya-saṃhitā (76 chapters)</a></p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
