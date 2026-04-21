'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Download, Upload, Building, User, DollarSign, Palette, Sparkles, Phone, Mail, MapPin, Globe, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nationalities, worldCountries, countriesWithCities } from '@/lib/cities';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';


const commonJobTitles = [ "Accountant", "Actor", "Architect", "Baker", "Barista", "Bartender", "Beautician", "Bellboy", "Bus Driver", "Butcher", "Carpenter", "Cashier", "Chef", "Cleaner", "Construction Worker", "Cook", "Customer Service Representative", "Data Entry Clerk", "Delivery Driver", "Designer", "Dishwasher", "Doctor", "Electrician", "Engineer", "Farmer", "Fashion Designer", "Firefighter", "Fisherman", "Flight Attendant", "Florist", "Foreman", "Forklift Operator", "Factory Worker", "General Helper", "Graphic Designer", "Hairdresser", "Heavy Driver", "Heavy Equipment Operator", "Heavy Trailer Driver", "Hotel Manager", "Housekeeper", "Human Resources Manager", "IT Specialist", "Janitor", "Journalist", "Laborer", "Landscaper", "Laundry Worker", "Lawyer", "Librarian", "Lifeguard", "Light Vehicle Driver", "Line Cook", "Machine Operator", "Maid", "Maintenance Worker", "Manager", "Marketing Manager", "Mason", "Mechanic", "Motorcycle Driver", "Nanny", "Nurse", "Office Assistant", "Painter", "Packer", "Pharmacist", "Photographer", "Pilot", "Plumber", "Police Officer", "Porter", "Project Manager", "Real Estate Agent", "Receptionist", "Sales Associate", "Sales Manager", "Scientist", "Seaman", "Security Guard", "Server", "Software Developer", "Storekeeper", "Supervisor", "Tailor", "Taxi Driver", "Teacher", "Technician", "Telemarketer", "Tile Fitter", "Tour Guide", "Translator", "Travel Agent", "Truck Driver", "Waiter", "Waitress", "Warehouse Worker", "Welder", "Writer", "Other" ];

const titleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  let words = '';
  let i = 0;

  function convertLessThanOneThousand(num: number): string {
    let currentWords = '';
  
    if (num >= 100) {
      currentWords += `${ones[Math.floor(num / 100)]} Hundred`;
      num %= 100;
      if (num > 0) currentWords += ' ';
    }
  
    if (num >= 20) {
        currentWords += tens[Math.floor(num/10)];
        if (num % 10 > 0) {
            currentWords += ' ' + ones[num % 10];
        }
    } else if (num >= 10) {
        currentWords += teens[num - 10];
    } else if (num > 0) {
        currentWords += ones[num];
    }
  
    return currentWords.trim();
  }

  do {
    const n = num % 1000;
    if (n !== 0) {
      const s = convertLessThanOneThousand(n);
      words = `${s} ${thousands[i]} ${words}`.trim();
    }
    i++;
    num = Math.floor(num / 1000);
  } while (num > 0);

  return words.trim();
}


const formSchema = z.object({
  // Employee
  employeeTitle: z.string().min(1, "Title is required."),
  employeeName: z.string().min(1, "Employee name is required."),
  employeePhone: z.string().optional(),
  employeeEmail: z.string().email().optional().or(z.literal('')),
  permanentStreetAddress: z.string().optional(),
  permanentCity: z.string().optional(),
  manualPermanentCity: z.string().optional(),
  permanentCountry: z.string().optional(),
  manualPermanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  currentStreetAddress: z.string().optional(),
  currentCity: z.string().optional(),
  manualCurrentCity: z.string().optional(),
  currentCountry: z.string().optional(),
  manualCurrentCountry: z.string().optional(),
  currentPostalCode: z.string().optional(),
  jobTitle: z.string().min(1, "Job Title is required."),
  manualJobTitle: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required."),
  passportNumber: z.string().min(1, "Passport number is required."),
  joiningDate: z.string().min(1, "Joining date is required."),
  employeeId: z.string().optional(),
  
  // Company
  companyName: z.string().min(1, "Company name is required."),
  secondaryCompanyName: z.string().optional(),
  companyAddress: z.string().min(1, "Street address is required."),
  companyCity: z.string().optional(),
  manualCompanyCity: z.string().optional(),
  companyCountry: z.string().min(1, "Company country is required."),
  manualCompanyCountry: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal('')),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  panVatNumber: z.string().optional(),
  companyLogo: z.any().optional(),

  // Certificate Details
  certificateDate: z.string().min(1, "Date is required"),
  certificatePurpose: z.string().optional(),
  recipientName: z.string().min(1, "Recipient name is required (e.g., Embassy of...)"),
  
  // Salary Details (for Salary Certificate)
  basicSalary: z.string().optional(),
  allowances: z.string().optional(),
  totalSalary: z.string().optional(),
  currency: z.string().default('AED'),
  
  // NOC Details
  nocPurpose: z.string().min(1, "Purpose for the NOC is required."),
  nocValidityDays: z.string().default('30'),

  // Authorized Signatory
  authorizedSignatoryName: z.string().min(1, "Signatory name is required."),
  authorizedSignatoryPosition: z.string().min(1, "Signatory position is required."),
  authorizedSignature: z.any().optional(),
  companyStamp: z.any().optional(),
  showDigitalNote: z.boolean().optional(),
});

type CertificateFormData = z.infer<typeof formSchema>;

const paperStyleClasses: Record<string, string> = {
    standard: 'bg-white',
    cream: 'bg-[#FFFDD0]',
    lokta: 'bg-[#EAE0D5]',
    'modern-blue': 'bg-blue-50',
    'formal-gray': 'bg-gray-100',
    'classic-footer': 'bg-white',
};

const useDraggable = (elRef: React.RefObject<HTMLElement>, onDrag: (pos: { x: number, y: number }) => void, isLocked: boolean, zoom: number) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const elStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        if (!elRef.current) return;
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        elStartRef.current = { x: elRef.current.offsetLeft, y: elRef.current.offsetTop };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !elRef.current?.parentElement) return;
            const dx = (e.clientX - dragStartRef.current.x) / zoom;
            const dy = (e.clientY - dragStartRef.current.y) / zoom;
            
            let newX = elStartRef.current.x + dx;
            let newY = elStartRef.current.y + dy;
            
            onDrag({ x: newX, y: newY });
        };
    
        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [elRef, onDrag, isLocked, zoom]);

    return { onMouseDown: handleMouseDown };
};

const NocPreview = React.forwardRef<HTMLDivElement, { values: CertificateFormData, logo: string | null, logoWidth: number, logoAspectRatio: number, signature: string | null, fontFamily: string, logoPosition: any, headerTextPosition: any, headerTextAlign: any, logoRef: any, headerTextRef: any, onLogoMouseDown: any, onHeaderTextMouseDown: any, templateStyle: string, headerColor: string, headerAddressColor: string, headerBackgroundColor: string, headerBackgroundOpacity: number, footerCompanyNameSize: number, footerTextSize: number, headerCompanyNameSize: number, datePosition: any, dateRef: any, onDateMouseDown: any, footerPosition: any, footerRef: any, onFooterMouseDown: any, backgroundWatermarkPreview: string | null, backgroundWatermarkSize: number, backgroundWatermarkOpacity: number, backgroundWatermarkRotation: number, backgroundWatermarkPosition: any, backgroundWatermarkRef: any, onBackgroundWatermarkMouseDown: any, footerTextColor: string, secondaryCompanyNamePosition: any, secondaryCompanyNameRef: any, onSecondaryCompanyNameMouseDown: any, secondaryCompanyNameColor: string, secondaryCompanyNameSize: number }>(({ values, logo, logoWidth, logoAspectRatio, signature, fontFamily, logoPosition, headerTextPosition, headerTextAlign, logoRef, headerTextRef, onLogoMouseDown, onHeaderTextMouseDown, templateStyle, headerColor, headerAddressColor, headerBackgroundColor, headerBackgroundOpacity, footerCompanyNameSize, footerTextSize, headerCompanyNameSize, datePosition, dateRef, onDateMouseDown, footerPosition, footerRef, onFooterMouseDown, backgroundWatermarkPreview, backgroundWatermarkSize, backgroundWatermarkOpacity, backgroundWatermarkRotation, backgroundWatermarkPosition, backgroundWatermarkRef, onBackgroundWatermarkMouseDown, footerTextColor, secondaryCompanyNamePosition, secondaryCompanyNameRef, onSecondaryCompanyNameMouseDown, secondaryCompanyNameColor, secondaryCompanyNameSize }, ref) => {
    const logoHeight = logoAspectRatio > 0 ? logoWidth / logoAspectRatio : 0;
    const pronoun = values.employeeTitle === 'Mr.' ? 'his' : 'her';
    const heShe = values.employeeTitle === 'Mr.' ? 'He' : 'She';
    const finalJobTitle = values.jobTitle === 'Other' ? values.manualJobTitle : values.jobTitle;
    const finalCompanyCity = values.companyCity === 'Other' ? values.manualCompanyCity : values.companyCity;
    const finalCompanyCountry = values.companyCountry === 'Other' ? values.manualCompanyCountry : values.companyCountry;
    const companyFullAddress = [values.companyAddress, finalCompanyCity, finalCompanyCountry].filter(Boolean).join(', ');
    
    const companyNameDisplay = values.companyName;
    
    const Watermark = () => (
      <>
        {backgroundWatermarkPreview && (
            <div
                ref={backgroundWatermarkRef}
                className="absolute cursor-move"
                style={{
                    left: `${backgroundWatermarkPosition.x}%`,
                    top: `${backgroundWatermarkPosition.y}%`,
                    width: `${backgroundWatermarkSize}%`,
                    opacity: backgroundWatermarkOpacity,
                    transform: `translate(-50%, -50%) rotate(${backgroundWatermarkRotation}deg)`,
                    zIndex: 0,
                }}
                onMouseDown={onBackgroundWatermarkMouseDown}
            >
                <Image
                    src={backgroundWatermarkPreview}
                    alt="Background Watermark"
                    layout="responsive"
                    width={500}
                    height={500}
                    objectFit="contain"
                    className="pointer-events-none"
                />
            </div>
        )}
      </>
    );

    const ModernLayout = (
        <div className="p-12 text-black text-sm relative" style={{ fontFamily }}>
             <Watermark />
             {/* Header Background */}
            <div 
                className="absolute top-0 left-0 right-0 h-[150px] -z-10"
                style={{ backgroundColor: headerBackgroundColor, opacity: headerBackgroundOpacity }} 
            />
             {/* Draggable Logo */}
            {logo && (
                <div
                    ref={logoRef}
                    className="absolute cursor-move z-10"
                    style={{ 
                        left: `${logoPosition.x}%`, 
                        top: `${logoPosition.y}%`, 
                        transform: 'translate(-50%, -50%)',
                        width: `${logoWidth}px`,
                        height: logoHeight ? `${logoHeight}px` : 'auto',
                    }}
                    onMouseDown={onLogoMouseDown}
                >
                    <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                </div>
            )}

            {/* Draggable Header Text */}
            <div
                ref={headerTextRef}
                className="absolute cursor-move z-10"
                style={{
                    left: `${headerTextPosition.x}%`,
                    top: `${headerTextPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: headerTextAlign,
                    width: '80%',
                }}
                onMouseDown={onHeaderTextMouseDown}
            >
                 <div className="flex flex-col gap-1">
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt`, lineHeight: 1.2 }}>{companyNameDisplay}</p>
                    <div style={{color: headerAddressColor}}>
                        {companyFullAddress && <p className="flex items-center gap-1.5 text-xs"><MapPin className="w-3 h-3"/> {companyFullAddress}</p>}
                        <div className={cn("flex gap-4 text-xs mt-1", `justify-${headerTextAlign}`)}>
                            {values.companyPhone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</p>}
                            {values.companyEmail && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {values.secondaryCompanyName && (
                <div
                    ref={secondaryCompanyNameRef}
                    className="absolute cursor-move z-10"
                    style={{
                        left: `${secondaryCompanyNamePosition.x}%`,
                        top: `${secondaryCompanyNamePosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: headerTextAlign,
                        width: '80%',
                    }}
                    onMouseDown={onSecondaryCompanyNameMouseDown}
                >
                    <p style={{ color: secondaryCompanyNameColor, fontSize: `${secondaryCompanyNameSize}pt` }}>
                        {values.secondaryCompanyName}
                    </p>
                </div>
            )}

            <main style={{marginTop: '150px'}} className="border-t pt-4 relative z-10">
                 <div style={{ position: 'absolute', right: 0, top: '5px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                 </div>
                <p className="font-bold mb-2">To,</p>
                <p className="font-bold mb-8">{values.recipientName}</p>

                <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">NO OBJECTION CERTIFICATE</h1>

                <div className="space-y-4 leading-relaxed">
                     <p>
                        This is to certify that <strong>{values.employeeTitle} {values.employeeName}</strong>, 
                        holder of {values.nationality} Passport Number: <strong>{values.passportNumber}</strong>, 
                        is currently employed with <strong>{values.companyName}</strong> as a <strong>{finalJobTitle}</strong>. 
                        {heShe} has been working with us since {values.joiningDate || '[Joining Date]'}
                        {values.employeeId && `, under Employee ID ${values.employeeId}`}.
                    </p>
                    <p>
                        We have no objection to <strong>{values.employeeName}</strong> {values.nocPurpose}. 
                        This NOC is issued upon {pronoun} request and doesn't imply any financial liability on the part of the company.
                    </p>
                    <p>
                        This certificate is valid for a period of {values.nocValidityDays || '30'} days from the date of issuance.
                    </p>
                </div>

                 <footer className="mt-20">
                    {values.showDigitalNote ? (
                        <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                    ) : (
                        <>
                            {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                            <div className="mt-2 pt-2 border-t border-gray-400 w-64">
                                <p className="font-bold">{values.authorizedSignatoryName}</p>
                                <p>{values.authorizedSignatoryPosition}</p>
                                <p>{values.companyName}</p>
                            </div>
                        </>
                    )}
                    {values.certificatePurpose && !values.showDigitalNote && (
                        <p className="text-xs italic mt-6 text-gray-500 w-full text-center">{values.certificatePurpose}</p>
                    )}
                </footer>
            </main>
        </div>
    );
    
     const FormalLayout = (
        <div className="p-12 text-black text-sm relative flex flex-col" style={{ fontFamily, minHeight: '297mm' }}>
             <Watermark />
             {/* Draggable Logo */}
            {logo && (
                <div
                    ref={logoRef}
                    className="absolute cursor-move z-10"
                    style={{ 
                        left: `${logoPosition.x}%`, 
                        top: `${logoPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${logoWidth}px`,
                        height: logoHeight ? `${logoHeight}px` : 'auto',
                    }}
                    onMouseDown={onLogoMouseDown}
                >
                    <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                </div>
            )}
            {/* Draggable Header Text */}
            <div
                ref={headerTextRef}
                className="absolute cursor-move z-10"
                style={{
                    left: `${headerTextPosition.x}%`,
                    top: `${headerTextPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: headerTextAlign,
                    width: '80%',
                }}
                onMouseDown={onHeaderTextMouseDown}
            >
                <div className="flex flex-col gap-1">
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt`, lineHeight: 1.2 }}>{companyNameDisplay}</p>
                </div>
            </div>

            {values.secondaryCompanyName && (
                <div
                    ref={secondaryCompanyNameRef}
                    className="absolute cursor-move z-10"
                    style={{
                        left: `${secondaryCompanyNamePosition.x}%`,
                        top: `${secondaryCompanyNamePosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: headerTextAlign,
                        width: '80%',
                    }}
                    onMouseDown={onSecondaryCompanyNameMouseDown}
                >
                    <p style={{ color: secondaryCompanyNameColor, fontSize: `${secondaryCompanyNameSize}pt` }}>
                        {values.secondaryCompanyName}
                    </p>
                </div>
            )}

            <main className="flex-grow relative z-10" style={{marginTop: '100px'}}>
                 <div style={{ position: 'absolute', right: 0, top: '5px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                 </div>
                <p className="font-bold mb-2">To,</p>
                <p className="font-bold mb-8">{values.recipientName}</p>
                <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">NO OBJECTION CERTIFICATE</h1>

                <div className="space-y-4 leading-relaxed">
                     <p>
                        This is to certify that <strong>{values.employeeTitle} {values.employeeName}</strong>, 
                        holder of {values.nationality} Passport Number: <strong>{values.passportNumber}</strong>, 
                        is currently employed with <strong>{values.companyName}</strong> as a <strong>{finalJobTitle}</strong>. 
                        {heShe} has been working with us since {values.joiningDate || '[Joining Date]'}
                        {values.employeeId && `, under Employee ID ${values.employeeId}`}.
                    </p>
                    <p>
                        We have no objection to <strong>{values.employeeName}</strong> {values.nocPurpose}. 
                        However, this letter is issued upon {pronoun} request and does not constitute any guarantee, liability, or financial commitment on behalf of the company.
                    </p>
                    <p>
                        This letter is issued without any responsibility, guarantee, or liability on the part of the company and any of its officers. It is valid for a period of {values.nocValidityDays || '30'} days from the date of issuance.
                    </p>
                </div>
                 {values.showDigitalNote ? (
                    <div className="mt-20">
                        <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                    </div>
                ) : (
                    <div className="mt-20">
                        {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                        <div className="pt-2 w-64">
                            <p className="font-bold">{values.authorizedSignatoryName}</p>
                            <p>{values.authorizedSignatoryPosition}</p>
                        </div>
                    </div>
                )}
            </main>
             <footer
                className="text-center pt-3 mt-auto pb-2"
                style={{ fontSize: `${footerTextSize}pt`, borderTopWidth: '2px', borderColor: headerColor, color: footerTextColor }}
            >
                <p className="font-bold mb-2" style={{ color: headerColor, fontSize: `${footerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                    {companyFullAddress && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {companyFullAddress}</span>}
                    {values.companyPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</span>}
                    {values.companyEmail && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</span>}
                    {values.companyWebsite && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> {values.companyWebsite}</span>}
                    {values.panVatNumber && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3"/> PAN/VAT: {values.panVatNumber}</span>}
                </div>
                 {values.certificatePurpose && (
                    <p className="text-xs italic mt-2">{values.certificatePurpose}</p>
                )}
            </footer>
        </div>
    );

    const ClassicFooterLayout = (
        <div className="p-12 text-black text-sm relative" style={{ fontFamily, minHeight: '297mm' }}>
             <Watermark />
             <header className="absolute top-12 left-12 right-12 z-10">
                <div
                    ref={headerTextRef}
                    className="relative cursor-move"
                    style={{
                        left: `${headerTextPosition.x}%`,
                        top: '0px',
                        transform: 'translateX(-50%)',
                        textAlign: headerTextAlign,
                        width: '100%',
                    }}
                    onMouseDown={onHeaderTextMouseDown}
                >
                     {logo && (
                        <div
                            ref={logoRef}
                            className="absolute cursor-move"
                            style={{ 
                                left: `${logoPosition.x}%`, 
                                top: `${logoPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: `${logoWidth}px`,
                                height: logoHeight ? `${logoHeight}px` : 'auto',
                            }}
                            onMouseDown={onLogoMouseDown}
                        >
                            <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                        </div>
                    )}
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                </div>
            </header>
            <main className="flex-grow relative z-10" style={{paddingTop: '100px'}}>
                 <div style={{ position: 'absolute', right: 0, top: '50px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                 </div>
                <div style={{ marginTop: '50px' }}>
                    <p className="font-bold mb-2">To,</p>
                    <p className="font-bold mb-8">{values.recipientName}</p>
                    <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">NO OBJECTION CERTIFICATE</h1>

                    <div className="space-y-4 leading-relaxed">
                        <p>This is to certify that <strong>{values.employeeTitle} {values.employeeName}</strong>, holder of {values.nationality} Passport Number: <strong>{values.passportNumber}</strong>, is currently employed with <strong>{values.companyName}</strong> as a <strong>{finalJobTitle}</strong>. {heShe} has been working with us since {values.joiningDate || '[Joining Date]'}{values.employeeId && `, under Employee ID ${values.employeeId}`}.</p>
                        <p>We have no objection to <strong>{values.employeeName}</strong> {values.nocPurpose}. This NOC is issued upon {pronoun} request and doesn't imply any financial liability on the part of the company.</p>
                        <p>This certificate is valid for a period of {values.nocValidityDays || '30'} days from the date of issuance.</p>
                    </div>

                    {values.showDigitalNote ? (
                        <div className="mt-20">
                             <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                        </div>
                    ) : (
                        <div className="mt-20">
                            {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                            <div className="pt-2 w-64">
                                <p className="font-bold">{values.authorizedSignatoryName}</p>
                                <p>{values.authorizedSignatoryPosition}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
             <div
                ref={footerRef}
                className="absolute cursor-move"
                style={{
                    left: `${footerPosition.x}%`,
                    top: `${footerPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '90%'
                }}
                onMouseDown={onFooterMouseDown}
            >
                <footer className="text-center pt-4 pb-2" style={{ fontSize: `${footerTextSize}pt`, borderTopWidth: '2px', borderColor: headerColor, color: footerTextColor }}>
                     <p className="font-bold mb-2" style={{ color: headerColor, fontSize: `${footerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                     <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                        {companyFullAddress && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {companyFullAddress}</span>}
                        {values.companyPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</span>}
                        {values.companyEmail && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</span>}
                        {values.companyWebsite && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> {values.companyWebsite}</span>}
                        {values.panVatNumber && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3"/> PAN/VAT: {values.panVatNumber}</span>}
                    </div>
                    {values.certificatePurpose && (
                        <p className="text-xs italic mt-2">{values.certificatePurpose}</p>
                    )}
                </footer>
            </div>
        </div>
    );
    
    return (
        <div ref={ref}>
            {templateStyle === 'formal' ? FormalLayout : 
             templateStyle === 'classic-footer' ? ClassicFooterLayout : 
             ModernLayout}
        </div>
    );
});
NocPreview.displayName = 'NocPreview';

const SalaryCertPreview = React.forwardRef<HTMLDivElement, { values: CertificateFormData, logo: string | null, signature: string | null, stamp: string | null, logoWidth: number, logoAspectRatio: number, fontFamily: string, logoPosition: any, headerTextPosition: any, headerTextAlign: any, logoRef: any, headerTextRef: any, onLogoMouseDown: any, onHeaderTextMouseDown: any, templateStyle: string, headerColor: string, headerAddressColor: string, headerBackgroundColor: string, headerBackgroundOpacity: number, footerCompanyNameSize: number, footerTextSize: number, headerCompanyNameSize: number, datePosition: any, dateRef: any, onDateMouseDown: any, footerPosition: any, footerRef: any, onFooterMouseDown: any, backgroundWatermarkPreview: string | null, backgroundWatermarkSize: number, backgroundWatermarkOpacity: number, backgroundWatermarkRotation: number, backgroundWatermarkPosition: any, backgroundWatermarkRef: any, onBackgroundWatermarkMouseDown: any, footerTextColor: string, secondaryCompanyNamePosition: any, secondaryCompanyNameRef: any, onSecondaryCompanyNameMouseDown: any, secondaryCompanyNameColor: string, secondaryCompanyNameSize: number }>(({ values, logo, signature, stamp, logoWidth, logoAspectRatio, fontFamily, logoPosition, headerTextPosition, headerTextAlign, logoRef, headerTextRef, onLogoMouseDown, onHeaderTextMouseDown, templateStyle, headerColor, headerAddressColor, headerBackgroundColor, headerBackgroundOpacity, footerCompanyNameSize, footerTextSize, headerCompanyNameSize, datePosition, dateRef, onDateMouseDown, footerPosition, footerRef, onFooterMouseDown, backgroundWatermarkPreview, backgroundWatermarkSize, backgroundWatermarkOpacity, backgroundWatermarkRotation, backgroundWatermarkPosition, backgroundWatermarkRef, onBackgroundWatermarkMouseDown, footerTextColor, secondaryCompanyNamePosition, secondaryCompanyNameRef, onSecondaryCompanyNameMouseDown, secondaryCompanyNameColor, secondaryCompanyNameSize }, ref) => {
    const logoHeight = logoAspectRatio > 0 ? logoWidth / logoAspectRatio : 0;
    const finalJobTitle = values.jobTitle === 'Other' ? values.manualJobTitle : values.jobTitle;
    const finalCompanyCity = values.companyCity === 'Other' ? values.manualCompanyCity : values.companyCity;
    const finalCompanyCountry = values.companyCountry === 'Other' ? values.manualCompanyCountry : values.companyCountry;
    const companyFullAddress = [values.companyAddress, finalCompanyCity, finalCompanyCountry].filter(Boolean).join(', ');
    const heShe = values.employeeTitle === 'Mr.' ? 'He' : 'She';
    const hisHer = values.employeeTitle === 'Mr.' ? 'His' : 'His';
    const his_her_lower = values.employeeTitle === 'Mr.' ? 'his' : 'her';
    
    const companyNameDisplay = values.companyName;

    const currencyNames: Record<string, string> = {
        'AED': 'Dirhams',
        'USD': 'Dollars',
        'EUR': 'Euros',
        'NPR': 'Rupees',
        'INR': 'Rupees',
    };
    const currencyName = currencyNames[values.currency] || values.currency;
    const totalInWords = titleCase(numberToWords(Number(values.totalSalary || '0')));

    const Watermark = () => (
      <>
        {backgroundWatermarkPreview && (
            <div
                ref={backgroundWatermarkRef}
                className="absolute cursor-move"
                style={{
                    left: `${backgroundWatermarkPosition.x}%`,
                    top: `${backgroundWatermarkPosition.y}%`,
                    width: `${backgroundWatermarkSize}%`,
                    opacity: backgroundWatermarkOpacity,
                    transform: `translate(-50%, -50%) rotate(${backgroundWatermarkRotation}deg)`,
                    zIndex: 0,
                }}
                onMouseDown={onBackgroundWatermarkMouseDown}
            >
                <Image
                    src={backgroundWatermarkPreview}
                    alt="Background Watermark"
                    layout="responsive"
                    width={500}
                    height={500}
                    objectFit="contain"
                    className="pointer-events-none"
                />
            </div>
        )}
      </>
    );

    const ModernLayout = (
         <div className="p-12 text-black text-sm relative" style={{ fontFamily }}>
             <Watermark />
             {/* Header Background */}
            <div 
                className="absolute top-0 left-0 right-0 h-[150px] -z-10"
                style={{ backgroundColor: headerBackgroundColor, opacity: headerBackgroundOpacity }} 
            />
             {/* Draggable Logo */}
            {logo && (
                <div
                    ref={logoRef}
                    className="absolute cursor-move z-10"
                    style={{ 
                        left: `${logoPosition.x}%`, 
                        top: `${logoPosition.y}%`, 
                        transform: 'translate(-50%, -50%)',
                        width: `${logoWidth}px`,
                        height: logoHeight ? `${logoHeight}px` : 'auto',
                    }}
                    onMouseDown={onLogoMouseDown}
                >
                    <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                </div>
            )}

            {/* Draggable Header Text */}
            <div
                ref={headerTextRef}
                className="absolute cursor-move z-10"
                style={{
                    left: `${headerTextPosition.x}%`,
                    top: `${headerTextPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: headerTextAlign,
                    width: '80%',
                }}
                onMouseDown={onHeaderTextMouseDown}
            >
                <div className="flex flex-col gap-1">
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt`, lineHeight: 1.2 }}>{companyNameDisplay}</p>
                    <div style={{color: headerAddressColor}}>
                        {companyFullAddress && <p className="flex items-center gap-1.5 text-xs"><MapPin className="w-3 h-3"/> {companyFullAddress}</p>}
                         <div className={cn("flex gap-4 text-xs mt-1", `justify-${headerTextAlign}`)}>
                            {values.companyPhone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</p>}
                            {values.companyEmail && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</p>}
                        </div>
                    </div>
                </div>
            </div>

             {values.secondaryCompanyName && (
                <div
                    ref={secondaryCompanyNameRef}
                    className="absolute cursor-move z-10"
                    style={{
                        left: `${secondaryCompanyNamePosition.x}%`,
                        top: `${secondaryCompanyNamePosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: headerTextAlign,
                        width: '80%',
                    }}
                    onMouseDown={onSecondaryCompanyNameMouseDown}
                >
                    <p style={{ color: secondaryCompanyNameColor, fontSize: `${secondaryCompanyNameSize}pt` }}>
                        {values.secondaryCompanyName}
                    </p>
                </div>
            )}

            <main style={{marginTop: '150px'}} className="border-t pt-4 relative z-10">
                 <div style={{ position: 'absolute', right: 0, top: '5px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                 </div>
                <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">TO WHOM IT MAY CONCERN</h1>
                <h2 className="text-center font-bold text-base underline underline-offset-4 mb-8">Salary Certificate</h2>
                
                <div className="space-y-4 leading-relaxed">
                    <p>This is to certify that <strong>{values.employeeTitle} {values.employeeName}</strong>, a national of <strong>{values.nationality}</strong> bearing Passport No. <strong>{values.passportNumber}</strong>, is a full-time employee at our company, <strong>{values.companyName}</strong>. {heShe} joined our organization on <strong>{values.joiningDate || '[Joining Date]'}</strong> and currently holds the position of <strong>{finalJobTitle}</strong>{values.employeeId && ` (Employee ID: ${values.employeeId})`}.</p>
                    <p>{hisHer} monthly salary is as follows:</p>
                    <table className="w-full my-4 text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-2 border border-gray-300 text-left font-semibold">Description</th>
                                <th className="p-2 border border-gray-300 text-right font-semibold">Amount ({values.currency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 border border-gray-300">Basic Salary</td>
                                <td className="p-2 border border-gray-300 text-right">{values.basicSalary || '0.00'}</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gray-300">Allowances</td>
                                <td className="p-2 border border-gray-300 text-right">{values.allowances || '0.00'}</td>
                            </tr>
                        </tbody>
                        <tfoot className="font-bold bg-gray-100">
                            <tr>
                                <td className="p-2 border border-gray-300 text-left">Total Salary</td>
                                <td className="p-2 border border-gray-300 text-right">{values.totalSalary || '0.00'}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <p className="text-sm">
                        <strong>In words:</strong> {totalInWords} {currencyName} Only.
                    </p>
                    <p>This certificate is issued upon {his_her_lower} request for whatever legal purpose it may serve.</p>
                </div>
                
                 <footer className="mt-20">
                    {values.showDigitalNote ? (
                        <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                    ) : (
                        <>
                            {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                            <div className="pt-2 border-t border-gray-400 w-64">
                                <p className="font-bold">{values.authorizedSignatoryName}</p>
                                <p>{values.authorizedSignatoryPosition}</p>
                            </div>
                        </>
                    )}
                     {values.certificatePurpose && !values.showDigitalNote && (
                        <p className="text-xs italic mt-6 text-gray-500 w-full text-center">{values.certificatePurpose}</p>
                    )}
                </footer>
            </main>
        </div>
    );
    
    const FormalLayout = (
        <div className="p-12 text-black text-sm relative flex flex-col" style={{ fontFamily, minHeight: '297mm' }}>
             <Watermark />
            {/* Draggable Logo */}
            {logo && (
                <div
                    ref={logoRef}
                    className="absolute cursor-move z-10"
                    style={{ 
                        left: `${logoPosition.x}%`, 
                        top: `${logoPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${logoWidth}px`,
                        height: logoHeight ? `${logoHeight}px` : 'auto',
                    }}
                    onMouseDown={onLogoMouseDown}
                >
                    <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                </div>
            )}
            {/* Draggable Header Text */}
            <div
                ref={headerTextRef}
                className="absolute cursor-move z-10"
                style={{
                    left: `${headerTextPosition.x}%`,
                    top: `${headerTextPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: headerTextAlign,
                    width: '80%',
                }}
                onMouseDown={onHeaderTextMouseDown}
            >
                <div className="flex flex-col gap-1">
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt`, lineHeight: 1.2 }}>{companyNameDisplay}</p>
                </div>
            </div>

             {values.secondaryCompanyName && (
                <div
                    ref={secondaryCompanyNameRef}
                    className="absolute cursor-move z-10"
                    style={{
                        left: `${secondaryCompanyNamePosition.x}%`,
                        top: `${secondaryCompanyNamePosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: headerTextAlign,
                        width: '80%',
                    }}
                    onMouseDown={onSecondaryCompanyNameMouseDown}
                >
                    <p style={{ color: secondaryCompanyNameColor, fontSize: `${secondaryCompanyNameSize}pt` }}>
                        {values.secondaryCompanyName}
                    </p>
                </div>
            )}

            <main className="flex-grow relative z-10" style={{marginTop: '100px'}}>
                 <div style={{ position: 'absolute', right: 0, top: '5px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                 </div>
                 <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">Salary Certificate</h1>
                 <p className="leading-relaxed">This is to certify that <b>{values.employeeTitle} {values.employeeName}</b>, a national of <b>{values.nationality}</b> bearing Passport No. <b>{values.passportNumber}</b>, is a full-time employee at our company, <b>{values.companyName}</b>. {heShe} joined our organization on <b>{values.joiningDate || '[Joining Date]'}</b> and currently holds the position of <b>{finalJobTitle}</b>{values.employeeId && ` (Employee ID: ${values.employeeId})`}.</p>
                 <p className="mt-4 leading-relaxed">{hisHer} current salary details are as follows:</p>
                  <table className="w-full my-4 text-sm border-collapse border border-gray-300">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border border-gray-300 text-left font-semibold">Description</th>
                            <th className="p-2 border border-gray-300 text-right font-semibold">Amount ({values.currency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border border-gray-300">Basic Salary</td>
                            <td className="p-2 border border-gray-300 text-right">{values.basicSalary || '0.00'}</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-gray-300">Allowances</td>
                            <td className="p-2 border border-gray-300 text-right">{values.allowances || '0.00'}</td>
                        </tr>
                    </tbody>
                    <tfoot className="font-bold bg-gray-100">
                        <tr>
                            <td className="p-2 border border-gray-300 text-left">Total Salary</td>
                            <td className="p-2 border border-gray-300 text-right">{values.totalSalary || '0.00'}</td>
                        </tr>
                    </tfoot>
                  </table>
                  <p className="text-sm mt-2">
                    <strong>In words:</strong> {totalInWords} {currencyName} Only.
                  </p>
                 <p className="mt-4 leading-relaxed">This certificate is issued upon {his_her_lower} request for official purposes.</p>
                 <p className="mt-8">Should you require any further information, please do not hesitate to contact us.</p>
                 
                 {values.showDigitalNote ? (
                    <div className="mt-20">
                        <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                    </div>
                 ) : (
                    <div className="mt-20">
                        {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                        <div className="pt-2 w-64">
                            <p className="font-bold">{values.authorizedSignatoryName}</p>
                            <p>{values.authorizedSignatoryPosition}</p>
                        </div>
                    </div>
                 )}
            </main>
             <footer
                className="text-center pt-3 mt-auto pb-2"
                style={{ fontSize: `${footerTextSize}pt`, borderTopWidth: '2px', borderColor: headerColor, color: footerTextColor }}
            >
                <p className="font-bold mb-2" style={{ color: headerColor, fontSize: `${footerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                    {companyFullAddress && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {companyFullAddress}</span>}
                    {values.companyPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</span>}
                    {values.companyEmail && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</span>}
                    {values.companyWebsite && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> {values.companyWebsite}</span>}
                    {values.panVatNumber && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3"/> PAN/VAT: {values.panVatNumber}</span>}
                </div>
                 {values.certificatePurpose && (
                    <p className="text-xs italic mt-2">{values.certificatePurpose}</p>
                )}
            </footer>
        </div>
    );
    
    const ClassicFooterLayout = (
        <div className="p-12 text-black text-sm relative" style={{ fontFamily, minHeight: '297mm' }}>
             <Watermark />
            <header className="absolute top-12 left-12 right-12 z-10">
                <div
                    ref={headerTextRef}
                    className="relative cursor-move"
                    style={{
                        left: `${headerTextPosition.x}%`,
                        top: '0px',
                        transform: 'translateX(-50%)',
                        textAlign: headerTextAlign,
                        width: '100%',
                    }}
                    onMouseDown={onHeaderTextMouseDown}
                >
                     {logo && (
                        <div
                            ref={logoRef}
                            className="absolute cursor-move"
                            style={{ 
                                left: `${logoPosition.x}%`, 
                                top: `${logoPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: `${logoWidth}px`,
                                height: logoHeight ? `${logoHeight}px` : 'auto',
                            }}
                            onMouseDown={onLogoMouseDown}
                        >
                            <Image src={logo} alt="Company Logo" layout="fill" objectFit="contain" />
                        </div>
                    )}
                    <p className="font-bold" style={{ color: headerColor, fontSize: `${headerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                </div>
            </header>
            <main className="flex-grow relative z-10" style={{paddingTop: '100px'}}>
                <div style={{ position: 'absolute', right: '0px', top: '50px' }} className="cursor-move" ref={dateRef} onMouseDown={onDateMouseDown}>
                    <p>Date: {values.certificateDate}</p>
                </div>
                <div style={{ marginTop: '50px' }}>
                    <h1 className="text-center font-bold text-lg underline underline-offset-4 mb-8">Salary Certificate</h1>
                    <p className="leading-relaxed">This is to certify that <b>{values.employeeTitle} {values.employeeName}</b>, a national of <b>{values.nationality}</b> bearing Passport No. <b>{values.passportNumber}</b>, is a full-time employee at our company, <b>{values.companyName}</b>. {heShe} joined our organization on <b>{values.joiningDate || '[Joining Date]'}</b> and currently holds the position of <b>{finalJobTitle}</b>{values.employeeId && ` (Employee ID: ${values.employeeId})`}.</p>
                    <p className="mt-4 leading-relaxed">{hisHer} current salary details are as follows:</p>
                    <table className="w-full my-4 text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-2 border border-gray-300 text-left font-semibold">Description</th>
                                <th className="p-2 border border-gray-300 text-right font-semibold">Amount ({values.currency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 border border-gray-300">Basic Salary</td>
                                <td className="p-2 border border-gray-300 text-right">{values.basicSalary || '0.00'}</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gray-300">Allowances</td>
                                <td className="p-2 border border-gray-300 text-right">{values.allowances || '0.00'}</td>
                            </tr>
                        </tbody>
                        <tfoot className="font-bold bg-gray-100">
                            <tr>
                                <td className="p-2 border border-gray-300 text-left">Total Salary</td>
                                <td className="p-2 border border-gray-300 text-right">{values.totalSalary || '0.00'}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <p className="text-sm mt-2"><strong>In words:</strong> {totalInWords} {currencyName} Only.</p>
                    <p className="mt-4 leading-relaxed">This certificate is issued upon {his_her_lower} request for official purposes.</p>
                    {values.showDigitalNote ? (
                         <div className="mt-20">
                             <p className="text-xs italic text-gray-500 pt-8">This is a system-generated document and does not require a physical signature.</p>
                        </div>
                    ) : (
                        <div className="mt-20">
                            {signature && <Image src={signature} alt="Signature" width={150} height={75} className="object-contain mb-1"/>}
                            <div className="pt-2 w-64"><p className="font-bold">{values.authorizedSignatoryName}</p><p>{values.authorizedSignatoryPosition}</p></div>
                        </div>
                    )}
                </div>
            </main>
             <div
                ref={footerRef}
                className="absolute cursor-move"
                style={{
                    left: `${footerPosition.x}%`,
                    top: `${footerPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '90%'
                }}
                onMouseDown={onFooterMouseDown}
            >
                <footer className="text-center pt-4 pb-2" style={{ fontSize: `${footerTextSize}pt`, borderTopWidth: '2px', borderColor: headerColor, color: footerTextColor }}>
                    <p className="font-bold mb-2" style={{ color: headerColor, fontSize: `${footerCompanyNameSize}pt` }}>{companyNameDisplay}</p>
                    <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                        {companyFullAddress && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {companyFullAddress}</span>}
                        {values.companyPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {values.companyPhone}</span>}
                        {values.companyEmail && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3"/> {values.companyEmail}</span>}
                        {values.companyWebsite && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> {values.companyWebsite}</span>}
                        {values.panVatNumber && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3"/> PAN/VAT: {values.panVatNumber}</span>}
                    </div>
                    {values.certificatePurpose && (
                        <p className="text-xs italic mt-2">{values.certificatePurpose}</p>
                    )}
                </footer>
            </div>
        </div>
    );

    return (
        <div ref={ref}>
            {templateStyle === 'formal' ? FormalLayout : 
             templateStyle === 'classic-footer' ? ClassicFooterLayout :
             ModernLayout}
        </div>
    );
});
SalaryCertPreview.displayName = 'SalaryCertPreview';


export default function CompanyDocumentsPage() {
    const { toast } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [activeDocument, setActiveDocument] = useState<'noc' | 'salary'>('noc');
    
    // Refs
    const nocContainerRef = useRef<HTMLDivElement>(null);
    const salaryCertContainerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const headerTextRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const backgroundWatermarkRef = useRef<HTMLDivElement>(null);
    const secondaryCompanyNameRef = useRef<HTMLDivElement>(null);
    const stampRef = useRef<HTMLDivElement>(null);
    
    // Form and data
    const form = useForm<CertificateFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeTitle: 'Mr.',
            employeeName: '',
            jobTitle: '',
            manualJobPosition: '',
            nationality: 'Nepalese',
            passportNumber: '',
            joiningDate: '',
            employeeId: '',
            companyName: '',
            secondaryCompanyName: '',
            companyAddress: '',
            companyCity: '',
            manualCompanyCity: '',
            companyCountry: 'United Arab Emirates',
            manualCompanyCountry: '',
            companyPhone: '',
            companyEmail: '',
            companyWebsite: '',
            panVatNumber: '',
            certificateDate: new Date().toISOString().split('T')[0],
            certificatePurpose: 'This certificate is issued upon employee request for bank purposes only.',
            recipientName: '',
            basicSalary: '',
            allowances: '',
            totalSalary: '0',
            currency: 'AED',
            nocPurpose: 'for bank purposes.',
            nocValidityDays: '30',
            authorizedSignatoryName: '',
            authorizedSignatoryPosition: 'HR Manager',
            showDigitalNote: false,
        },
    });

    const allFormValues = form.watch();

    // UI state
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    const [backgroundWatermarkPreview, setBackgroundWatermarkPreview] = useState<string | null>(null);
    const [logoAspectRatio, setLogoAspectRatio] = useState(1);
    
    const [templateStyle, setTemplateStyle] = useState('modern');
    const [fontFamily, setFontFamily] = useState("'Poppins', sans-serif");
    const [paperStyle, setPaperStyle] = useState('standard');
    
    // Draggable state and handlers
    const [logoPosition, setLogoPosition] = useState({ x: 15, y: 12 });
    const { onMouseDown: onLogoMouseDown } = useDraggable(logoRef, (pos) => setLogoPosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);
    const [headerTextPosition, setHeaderTextPosition] = useState({ x: 50, y: 15 });
    const { onMouseDown: onHeaderTextMouseDown } = useDraggable(headerTextRef, (pos) => setHeaderTextPosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);
    const [datePosition, setDatePosition] = useState({ x: 0, y: 0 });
    const { onMouseDown: onDateMouseDown } = useDraggable(dateRef, setDatePosition, false, 1);
    const [footerPosition, setFooterPosition] = useState({ x: 50, y: 90 });
    const { onMouseDown: onFooterMouseDown } = useDraggable(footerRef, (pos) => setFooterPosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);
    const [backgroundWatermarkPosition, setBackgroundWatermarkPosition] = useState({ x: 50, y: 50 });
    const { onMouseDown: onBackgroundWatermarkMouseDown } = useDraggable(backgroundWatermarkRef, (pos) => setBackgroundWatermarkPosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);
    const [secondaryCompanyNamePosition, setSecondaryCompanyNamePosition] = useState({ x: 50, y: 20 });
    const { onMouseDown: onSecondaryCompanyNameMouseDown } = useDraggable(secondaryCompanyNameRef, (pos) => setSecondaryCompanyNamePosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);
    const [stampPosition, setStampPosition] = useState({ x: 85, y: 85 });
    const { onMouseDown: onStampMouseDown } = useDraggable(stampRef, (pos) => setStampPosition({x: (pos.x / (nocContainerRef.current?.offsetWidth || 1)) * 100, y: (pos.y / (nocContainerRef.current?.offsetHeight || 1)) * 100}), false, 1);

    
    const { watch, setValue } = form;
    const basicSalary = watch('basicSalary');
    const allowances = watch('allowances');
    
    useEffect(() => {
        const basic = parseFloat(basicSalary || '0');
        const allowance = parseFloat(allowances || '0');
        const total = basic + allowance;
        setValue('totalSalary', String(total));
    }, [basicSalary, allowances, setValue]);
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>, setAspectRatio?: React.Dispatch<React.SetStateAction<number>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    if (setAspectRatio) {
                        setAspectRatio(img.width / img.height);
                    }
                    setPreview(event.target?.result as string);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDownload = async (type: 'noc' | 'salary') => {
        const contentRef = type === 'noc' ? nocContainerRef : salaryCertContainerRef;
        const filename = type === 'noc' ? 'NOC.pdf' : 'Salary_Certificate.pdf';
        
        if (!contentRef.current) return;
        
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');

        toast({ title: 'Generating PDF...' });
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            useCORS: true,
            onclone: (document) => {
                // Hide controls in the cloned document for capture
                document.querySelectorAll('.drag-handle').forEach(el => (el as HTMLElement).style.display = 'none');
            }
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(filename);
    };

    const handleNavigate = (path: string) => router.push(path.startsWith('/') ? path : `/#${path}`);
    
    // Style controls
    const [logoWidth, setLogoWidth] = useState(132);
    const [headerCompanyNameSize, setHeaderCompanyNameSize] = useState(18);
    const [secondaryCompanyNameSize, setSecondaryCompanyNameSize] = useState(14);
    const [secondaryCompanyNameColor, setSecondaryCompanyNameColor] = useState('#333333');
    const [headerColor, setHeaderColor] = useState('#000000');
    const [headerAddressColor, setHeaderAddressColor] = useState('#555555');
    const [headerTextAlign, setHeaderTextAlign] = useState<'left' | 'center' | 'right'>('center');
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#FFFFFF');
    const [headerBackgroundOpacity, setHeaderBackgroundOpacity] = useState(0);
    const [footerCompanyNameSize, setFooterCompanyNameSize] = useState(11);
    const [footerTextSize, setFooterTextSize] = useState(8);
    const [footerTextColor, setFooterTextColor] = useState('#555555');
    const [stampSize, setStampSize] = useState(100);
    const [stampRotation, setStampRotation] = useState(-15);
    const [backgroundWatermarkSize, setBackgroundWatermarkSize] = useState(80);
    const [backgroundWatermarkOpacity, setBackgroundWatermarkOpacity] = useState(0.1);
    const [backgroundWatermarkRotation, setBackgroundWatermarkRotation] = useState(-25);

    const companyCountry = form.watch('companyCountry');
    const companyCities = useMemo(() => {
        if (!companyCountry || companyCountry === 'Other') return [];
        return countriesWithCities.find(c => c.country === companyCountry)?.cities || [];
    }, [companyCountry]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </span>
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-glow-primary font-headline">
                        Company Document Generator
                    </h1>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        Create professional NOC and Salary certificates with advanced customization.
                    </p>
                </div>
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <Form {...form}>
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Document Details</CardTitle>
                                    <CardDescription>Fill in the tabs to build your document.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="employee" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                                            <TabsTrigger value="employee" className="py-2.5 text-base gap-2"><User className="w-5 h-5 text-blue-500"/>Employee</TabsTrigger>
                                            <TabsTrigger value="company" className="py-2.5 text-base gap-2"><Building className="w-5 h-5 text-green-500"/>Company</TabsTrigger>
                                            <TabsTrigger value="certificate" className="py-2.5 text-base gap-2"><DollarSign className="w-5 h-5 text-yellow-500"/>Certificate</TabsTrigger>
                                            <TabsTrigger value="design" className="py-2.5 text-base gap-2"><Palette className="w-5 h-5 text-purple-500"/>Design</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="employee" className="space-y-4 pt-4">
                                            <FormField control={form.control} name="employeeTitle" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Mr.">Mr.</SelectItem><SelectItem value="Ms.">Ms.</SelectItem><SelectItem value="Mrs.">Mrs.</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="employeeName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="jobTitle" render={({ field }) => (
                                                <FormItem><FormLabel>Job Title</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a job title"/></SelectTrigger></FormControl>
                                                        <SelectContent><ScrollArea className="h-72">{commonJobTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</ScrollArea></SelectContent>
                                                    </Select>
                                                <FormMessage /></FormItem>
                                            )}/>
                                            {form.watch('jobTitle') === 'Other' && <FormField control={form.control} name="manualJobPosition" render={({ field }) => (<FormItem><FormLabel>Specify Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}
                                            <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nationality</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Nationality"/></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-72">{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="passportNumber" render={({ field }) => (<FormItem><FormLabel>Passport No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="joiningDate" render={({ field }) => (<FormItem><FormLabel>Joining Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="employeeId" render={({ field }) => (<FormItem><FormLabel>Employee ID (Opt.)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </TabsContent>

                                        <TabsContent value="company" className="space-y-4 pt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                     <FormItem>
                                                        <FormLabel>Company Logo</FormLabel>
                                                        <FormControl><Input type="file" name="companyLogo" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoPreview, setLogoAspectRatio)} className="file:text-foreground"/></FormControl>
                                                    </FormItem>
                                                    {logoPreview && (
                                                        <div className="space-y-2 pt-2">
                                                            <FormLabel>Logo Width: {logoWidth}px</FormLabel>
                                                            <Slider value={[logoWidth]} onValueChange={(v) => setLogoWidth(v[0])} max={400} min={50} step={1} />
                                                        </div>
                                                    )}
                                                </div>
                                                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                 <FormField control={form.control} name="secondaryCompanyName" render={({ field }) => ( <FormItem><FormLabel>Secondary / Translated Name (Optional)</FormLabel><FormControl><Input {...field} placeholder="e.g., कम्पनीको नाम" /></FormControl></FormItem> )}/>
                                                <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="companyCountry"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Country</FormLabel>
                                                                <Select onValueChange={(value) => {field.onChange(value); form.setValue('companyCity', '');}} value={field.value || ''}>
                                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <ScrollArea className="h-72">
                                                                            {worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                                            <SelectItem value="Other">Other</SelectItem>
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="companyCity"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>City/District</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ''} disabled={companyCities.length === 0}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <ScrollArea className="h-72">
                                                                            {companyCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                                            <SelectItem value="Other">Other</SelectItem>
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {form.watch('companyCity') === 'Other' && (
                                                    <FormField control={form.control} name="manualCompanyCity" render={({ field }) => (<FormItem><FormLabel className="text-[9px]">Specify City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                )}
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="companyPhone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="companyEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="companyWebsite" render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input type="url" placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="panVatNumber" render={({ field }) => (<FormItem><FormLabel>PAN/VAT Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </div>
                                                <div className="border-t pt-4 space-y-4">
                                                     <h4 className="font-semibold text-muted-foreground">Authorized Signatory</h4>
                                                     <FormField control={form.control} name="authorizedSignatoryName" render={({ field }) => (<FormItem><FormLabel>Signatory Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                     <FormField control={form.control} name="authorizedSignatoryPosition" render={({ field }) => (<FormItem><FormLabel>Signatory's Position</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                     <FormItem><FormLabel>Signature</FormLabel><FormControl><Input type="file" name="authorizedSignature" accept="image/*" onChange={(e) => handleFileUpload(e, setSignaturePreview)} className="file:text-foreground"/></FormControl></FormItem>
                                                     <FormField
                                                        control={form.control}
                                                        name="showDigitalNote"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>
                                                                        Add Digital Generation Note
                                                                    </FormLabel>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        This will add a note that the document is system-generated and requires no physical signature, hiding the signature block.
                                                                    </p>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="certificate" className="space-y-4 pt-4">
                                            <FormField control={form.control} name="certificateDate" render={({ field }) => (<FormItem><FormLabel>Date on Certificate</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="recipientName" render={({ field }) => (<FormItem><FormLabel>Recipient (e.g., The Embassy of...)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name="certificatePurpose" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Certificate Purpose (Footer Note)</FormLabel>
                                                    <FormControl><Textarea {...field} rows={3} /></FormControl>
                                                </FormItem>
                                            )} />

                                            <Tabs defaultValue="noc-details" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="noc-details">NOC Details</TabsTrigger>
                                                    <TabsTrigger value="salary-details">Salary Details</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="noc-details" className="space-y-4 pt-4">
                                                        <FormField control={form.control} name="nocPurpose" render={({ field }) => (<FormItem><FormLabel>Purpose of NOC</FormLabel><FormControl><Textarea {...field} rows={2} placeholder="e.g., applying for a tourist visa to Spain" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="nocValidityDays" render={({ field }) => (<FormItem><FormLabel>NOC Validity (in days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </TabsContent>
                                                <TabsContent value="salary-details" className="space-y-4 pt-4">
                                                    <div className="grid sm:grid-cols-3 gap-4 items-end">
                                                        <FormField control={form.control} name="basicSalary" render={({ field }) => (<FormItem><FormLabel>Basic Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="allowances" render={({ field }) => (<FormItem><FormLabel>Allowances</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                                            <SelectItem value="AED">AED</SelectItem>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="NPR">NPR</SelectItem>
                                                            <SelectItem value="INR">INR</SelectItem>
                                                        </SelectContent></Select></FormItem>)} />
                                                    </div>
                                                     <FormField control={form.control} name="totalSalary" render={({ field }) => (<FormItem><FormLabel>Total Salary</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted/50 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                                                </TabsContent>
                                            </Tabs>
                                        </TabsContent>
                                        <TabsContent value="design" className="pt-4 space-y-4">
                                            {/* Design controls from previous iteration */}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </Form>
                    </div>
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="noc" className="w-full" onValueChange={(value) => setActiveDocument(value as 'noc' | 'salary')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="noc">No Objection Certificate (NOC)</TabsTrigger>
                                <TabsTrigger value="salary">Salary Certificate</TabsTrigger>
                            </TabsList>
                            <TabsContent value="noc">
                                <Card className="mt-4">
                                    <CardHeader><CardTitle>NOC Preview</CardTitle></CardHeader>
                                    <CardContent>
                                        <div 
                                            className={cn("border rounded-md aspect-[210/297] w-full max-w-[210mm] mx-auto relative overflow-hidden", paperStyleClasses[paperStyle])}
                                        >
                                            <NocPreview 
                                                templateStyle={templateStyle}
                                                values={allFormValues}
                                                logo={logoPreview} 
                                                logoWidth={logoWidth} 
                                                logoAspectRatio={logoAspectRatio} 
                                                signature={signaturePreview} 
                                                fontFamily={fontFamily} 
                                                logoPosition={logoPosition}
                                                headerTextPosition={headerTextPosition}
                                                headerTextAlign={headerTextAlign}
                                                headerColor={headerColor}
                                                headerAddressColor={headerAddressColor}
                                                headerBackgroundColor={headerBackgroundColor}
                                                headerBackgroundOpacity={headerBackgroundOpacity}
                                                logoRef={logoRef}
                                                headerTextRef={headerTextRef}
                                                onLogoMouseDown={onLogoMouseDown}
                                                onHeaderTextMouseDown={onHeaderTextMouseDown}
                                                ref={nocContainerRef}
                                                footerCompanyNameSize={footerCompanyNameSize}
                                                footerTextSize={footerTextSize}
                                                footerTextColor={footerTextColor}
                                                headerCompanyNameSize={headerCompanyNameSize}
                                                datePosition={datePosition}
                                                dateRef={dateRef}
                                                onDateMouseDown={onDateMouseDown}
                                                footerPosition={footerPosition}
                                                footerRef={footerRef}
                                                onFooterMouseDown={onFooterMouseDown}
                                                backgroundWatermarkPreview={backgroundWatermarkPreview}
                                                backgroundWatermarkSize={backgroundWatermarkSize}
                                                backgroundWatermarkOpacity={backgroundWatermarkOpacity}
                                                backgroundWatermarkRotation={backgroundWatermarkRotation}
                                                backgroundWatermarkPosition={backgroundWatermarkPosition}
                                                backgroundWatermarkRef={backgroundWatermarkRef}
                                                onBackgroundWatermarkMouseDown={onBackgroundWatermarkMouseDown}
                                                secondaryCompanyNamePosition={secondaryCompanyNamePosition}
                                                secondaryCompanyNameRef={secondaryCompanyNameRef}
                                                onSecondaryCompanyNameMouseDown={onSecondaryCompanyNameMouseDown}
                                                secondaryCompanyNameColor={secondaryCompanyNameColor}
                                                secondaryCompanyNameSize={secondaryCompanyNameSize}
                                            />
                                            {stampPreview && (
                                                <div ref={stampRef} className="absolute cursor-move" style={{ left: `${stampPosition.x}%`, top: `${stampPosition.y}%`, width: `${stampSize}px`, height: `${stampSize}px`, transform: `translate(-50%, -50%) rotate(${stampRotation}deg)`}} onMouseDown={onStampMouseDown}>
                                                     <Image src={stampPreview} alt="Company Stamp" layout="fill" objectFit="contain" style={{ opacity: 0.7 }} />
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={() => handleDownload('noc')} className="w-full mt-4 gradient-button-gold"><Download className="mr-2"/>Download NOC</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <TabsContent value="salary">
                                <Card className="mt-4">
                                    <CardHeader><CardTitle>Salary Certificate Preview</CardTitle></CardHeader>
                                    <CardContent>
                                        <div 
                                            className={cn("border rounded-md aspect-[210/297] w-full max-w-[210mm] mx-auto relative overflow-hidden", paperStyleClasses[paperStyle])}
                                        >
                                            <SalaryCertPreview
                                                templateStyle={templateStyle}
                                                values={allFormValues}
                                                logo={logoPreview} 
                                                signature={signaturePreview}
                                                stamp={stampPreview}
                                                logoWidth={logoWidth}
                                                logoAspectRatio={logoAspectRatio}
                                                fontFamily={fontFamily}
                                                logoPosition={logoPosition}
                                                headerTextPosition={headerTextPosition}
                                                headerTextAlign={headerTextAlign}
                                                headerColor={headerColor}
                                                headerAddressColor={headerAddressColor}
                                                headerBackgroundColor={headerBackgroundColor}
                                                headerBackgroundOpacity={headerBackgroundOpacity}
                                                logoRef={logoRef}
                                                headerTextRef={headerTextRef}
                                                onLogoMouseDown={onLogoMouseDown}
                                                onHeaderTextMouseDown={onHeaderTextMouseDown}
                                                ref={salaryCertContainerRef}
                                                footerCompanyNameSize={footerCompanyNameSize}
                                                footerTextSize={footerTextSize}
                                                footerTextColor={footerTextColor}
                                                headerCompanyNameSize={headerCompanyNameSize}
                                                datePosition={datePosition}
                                                dateRef={dateRef}
                                                onDateMouseDown={onDateMouseDown}
                                                footerPosition={footerPosition}
                                                footerRef={footerRef}
                                                onFooterMouseDown={onFooterMouseDown}
                                                backgroundWatermarkPreview={backgroundWatermarkPreview}
                                                backgroundWatermarkSize={backgroundWatermarkSize}
                                                backgroundWatermarkOpacity={backgroundWatermarkOpacity}
                                                backgroundWatermarkRotation={backgroundWatermarkRotation}
                                                backgroundWatermarkPosition={backgroundWatermarkPosition}
                                                backgroundWatermarkRef={backgroundWatermarkRef}
                                                onBackgroundWatermarkMouseDown={onBackgroundWatermarkMouseDown}
                                                secondaryCompanyNamePosition={secondaryCompanyNamePosition}
                                                secondaryCompanyNameRef={secondaryCompanyNameRef}
                                                onSecondaryCompanyNameMouseDown={onSecondaryCompanyNameMouseDown}
                                                secondaryCompanyNameColor={secondaryCompanyNameColor}
                                                secondaryCompanyNameSize={secondaryCompanyNameSize}
                                            />
                                            {stampPreview && (
                                                <div ref={stampRef} className="absolute cursor-move" style={{ left: `${stampPosition.x}%`, top: `${stampPosition.y}%`, width: `${stampSize}px`, height: `${stampSize}px`, transform: `translate(-50%, -50%) rotate(${stampRotation}deg)`}} onMouseDown={onStampMouseDown}>
                                                     <Image src={stampPreview} alt="Company Stamp" layout="fill" objectFit="contain" style={{ opacity: 0.7 }} />
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={() => handleDownload('salary')} className="w-full mt-4 gradient-button-gold"><Download className="mr-2"/>Download Salary Certificate</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
