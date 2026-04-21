
'use client';

import React, { forwardRef } from 'react';
import { CombinedCVFormData } from '@/app/cv-builder/page';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CheckCircle2, Award } from 'lucide-react';

interface AtsCVPreviewProps {
    allFormValues: CombinedCVFormData;
    photoPreview: string | null;
    signatureImage: string | null;
    qrCodeUrl: string | null;
    fontFamily?: string;
    atsLayout?: string;
}

const AtsSection = ({ title, children, layout, color }: { title: string, children: React.ReactNode, layout?: string, color?: string }) => {
    const isExecutive = layout === 'executive';
    const isSleek = layout === 'sleek';
    const isEmerald = layout === 'emerald';

    return (
        <div className={cn("mt-4", isExecutive && "mt-6")}>
            <h3 className={cn(
                "text-sm font-bold uppercase tracking-wider mb-2",
                isExecutive ? "border-y py-1" : "border-b pb-1",
                isEmerald ? "bg-emerald-50 px-2 text-emerald-900 border-emerald-200" : "border-gray-300",
                isSleek && "border-l-4 pl-3"
            )} style={{ borderLeftColor: isSleek ? color : undefined, borderTopColor: isExecutive ? '#eee' : undefined, borderBottomColor: isExecutive ? '#eee' : undefined }}>
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
};

export const AtsCVPreview = forwardRef<HTMLDivElement, AtsCVPreviewProps>(({ 
    allFormValues, photoPreview, signatureImage, qrCodeUrl, fontFamily, atsLayout = 'standard' 
}, ref) => {
    const {
        firstName, middleName, lastName, phone, email, linkedin, 
        currentStreetAddress, currentCity, currentCountry, currentPostalCode,
        professionalSummary, experience, education, training, skills, 
        motherLanguage, manualMotherLanguage, languages, signaturePlacement,
        templateColor = '#000000', declaration
    } = allFormValues;
    
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const address = [currentStreetAddress, currentCity, currentPostalCode, currentCountry].filter(Boolean).join(', ');
    
    // Layout logic mapping
    const styles: Record<string, any> = {
        standard: { serif: true, centered: true },
        executive: { serif: true, boldHeaders: true, largeName: true },
        modern: { serif: false, spacing: 'relaxed' },
        technical: { gridSkills: true, compact: true },
        sleek: { accent: true, leftAlign: true },
        emerald: { themeColor: '#065f46', muted: true },
        compact: { tight: true, smallText: true },
        summary: { highlightSummary: true },
        traditional: { indent: true, classic: true },
        header: { inlineContact: true }
    };

    const s = styles[atsLayout] || styles.standard;

    return (
        <div ref={ref} className={cn(
            "w-full mx-auto aspect-[210/297] bg-white text-black overflow-hidden flex flex-col",
            s.tight ? "p-8 text-[10px]" : "p-12 text-[11px]"
        )} style={{ fontFamily: s.serif ? "'Times New Roman', Times, serif" : fontFamily }}>
            
            <header className={cn(
                "mb-6",
                s.centered ? "text-center" : "text-left",
                s.inlineContact && "border-b-2 pb-4"
            )}>
                <h1 className={cn(
                    "font-bold tracking-tight",
                    s.largeName ? "text-3xl" : "text-2xl"
                )} style={{ color: s.themeColor || '#000' }}>
                    {fullName.toUpperCase()}
                </h1>
                <div className={cn(
                    "mt-2 text-gray-600 font-medium",
                    s.inlineContact ? "flex flex-wrap gap-x-4 justify-center" : "space-y-0.5"
                )}>
                    {address && <p>{address}</p>}
                    <p>{phone} | {email}</p>
                    {linkedin && <p>{linkedin}</p>}
                </div>
            </header>

            <main className="flex-1">
                {professionalSummary && (
                    <AtsSection title="Professional Summary" layout={atsLayout} color={templateColor}>
                        <p className={cn("text-justify leading-relaxed", s.highlightSummary && "font-bold text-gray-800 italic")}>
                            {professionalSummary}
                        </p>
                    </AtsSection>
                )}
                
                {experience && experience.length > 0 && (
                    <AtsSection title="Work Experience" layout={atsLayout} color={templateColor}>
                        {experience.map((job, index) => (
                            <div key={index} className={cn("mb-4", s.indent && "pl-4")}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="font-bold text-sm uppercase">{job.jobTitle}</p>
                                    <p className="font-bold">{job.startDate} — {job.isCurrent ? 'Present' : job.endDate}</p>
                                </div>
                                <p className="font-bold italic text-gray-700">{job.company} | {job.city}, {job.country}</p>
                                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{job.duties}</p>
                            </div>
                        ))}
                    </AtsSection>
                )}

                {education && education.length > 0 && (
                    <AtsSection title="Academic History" layout={atsLayout} color={templateColor}>
                         {education.map((edu, index) => (
                            <div key={index} className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold uppercase">{edu.degree === 'Other' ? edu.manualDegree : edu.degree}</p>
                                    <p className="font-bold italic text-gray-600">{edu.university}</p>
                                </div>
                                <p className="font-bold">{edu.passingYear}</p>
                            </div>
                        ))}
                    </AtsSection>
                )}

                {training && training.length > 0 && (
                    <AtsSection title="Certifications" layout={atsLayout} color={templateColor}>
                        <div className="grid grid-cols-1 gap-2">
                            {training.map((t, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    <span className="font-bold">{t.title}</span>
                                    <span className="text-gray-500">— {t.institution}</span>
                                </div>
                            ))}
                        </div>
                    </AtsSection>
                )}

                {skills && skills.length > 0 && (
                    <AtsSection title="Core Competencies" layout={atsLayout} color={templateColor}>
                        <div className={cn(
                            "grid gap-x-4 gap-y-1",
                            s.gridSkills ? "grid-cols-3" : "grid-cols-2"
                        )}>
                            {skills.map((skill, index) => (
                                <p key={index} className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-black rounded-full" /> {skill}
                                </p>
                            ))}
                        </div>
                    </AtsSection>
                )}

                {(motherLanguage || (languages && languages.length > 0)) && (
                    <AtsSection title="Languages" layout={atsLayout} color={templateColor}>
                       <div className="space-y-2">
                        {motherLanguage && <p className="font-bold">{motherLanguage} (Native)</p>}
                        {languages && languages.map((lang, idx) => (
                            <div key={idx} className="text-[10px] leading-tight">
                                <span className="font-bold">{lang.language}:</span>
                                <span className="ml-2 text-gray-600">
                                    Listen ({lang.listening}), Read ({lang.reading}), Interact ({lang.spokenInteraction}), Produce ({lang.spokenProduction}), Write ({lang.writing})
                                </span>
                            </div>
                        ))}
                       </div>
                    </AtsSection>
                )}

                {declaration && (
                    <div className="mt-8 border-t pt-4">
                        <p className="font-bold text-gray-800 leading-relaxed text-justify italic">
                            <CheckCircle2 className="inline-block w-3 h-3 mr-1 text-primary" /> {declaration}
                        </p>
                    </div>
                )}
            </main>

            {signaturePlacement?.ats && signatureImage && (
                <div className="mt-10 flex flex-col items-end">
                    <div className="relative w-32 h-16 border-b border-gray-200">
                        <Image src={signatureImage} alt="Signature" fill className="object-contain" unoptimized />
                    </div>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{fullName}</p>
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center opacity-30 grayscale pointer-events-none">
                <p className="text-[8px] font-black uppercase tracking-[0.5em]">ATS Compliant Format • OmniTools AI</p>
                {qrCodeUrl && <Image src={qrCodeUrl} alt="QR" width={40} height={40} unoptimized />}
            </div>
        </div>
    );
});

AtsCVPreview.displayName = 'AtsCVPreview';
