'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { CombinedCVFormData } from '@/app/cv-builder/page';
import { Mail, Phone, Linkedin, MapPin, User, Briefcase, GraduationCap, Globe, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NormalCVPreviewProps {
    allFormValues: CombinedCVFormData;
    photoPreview: string | null;
    signatureImage: string | null;
    qrCodeUrl: string | null;
    templateColor?: string;
    fontFamily?: string;
    languageDisplayStyle?: 'star' | 'level';
    normalLayout?: string;
}

const Section = ({ title, children, className, color, layout }: { title: string, children: React.ReactNode, className?: string, color?: string, layout?: string }) => (
    <div className={cn("mt-4", className)}>
        <h3 className={cn(
            "text-base font-bold uppercase tracking-wider mb-2",
            layout === 'minimalist' ? "text-gray-400" : "border-b-2 pb-1"
        )} style={{ color: color, borderBottomColor: layout === 'minimalist' ? 'transparent' : color }}>
            {title}
        </h3>
        <div className="text-xs leading-relaxed">
            {children}
        </div>
    </div>
);

const StarRating = ({ level }: { level?: string }) => {
    const levelMap: Record<string, number> = {
        'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 5
    };
    const rating = level ? levelMap[level.toUpperCase()] || 0 : 0;
    if (!level || rating === 0) return null;

    return (
        <div className="flex items-center gap-0.5 text-xs" style={{ color: '#FFC107' }}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </div>
    );
};

export const NormalCVPreview = forwardRef<HTMLDivElement, NormalCVPreviewProps>(({ 
    allFormValues, photoPreview, signatureImage, qrCodeUrl, 
    templateColor = '#003366', fontFamily = 'sans-serif', 
    languageDisplayStyle = 'level', normalLayout = 'standard' 
}, ref) => {
    const {
        firstName, middleName, lastName, currentJob, manualCurrentJob, phone, email, linkedin,
        currentStreetAddress, currentCity, currentCountry, professionalSummary,
        experience, education, training, skills, motherLanguage, manualMotherLanguage,
        languages, photoShape, photoPlacement, signaturePlacement, declaration
    } = allFormValues;
    
    const finalCurrentJob = currentJob === 'Other' ? manualCurrentJob : currentJob;
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const fullAddress = [currentStreetAddress, currentCity, currentCountry].filter(Boolean).join(', ');
    
    const shapeClasses = {
        square: 'rounded-lg',
        round: 'rounded-full',
        oval: 'rounded-[50%]',
    };

    // Layout Logic mapping
    const styles: Record<string, any> = {
        standard: { headerBg: 'transparent', columns: 12 },
        creative: { headerBg: 'transparent', reverse: true, columns: 12 },
        executive: { headerBg: '#f8f9fa', centered: true, largeName: true },
        minimalist: { hideLines: true, tight: true, serif: true },
        'pro-sidebar': { sidebar: true, sidebarBg: '#f1f5f9' },
        gradient: { gradientHeader: true },
        'two-column': { split: true },
        technical: { compact: true, monoSkills: true },
        formal: { heavyBorder: true, boldLabels: true },
        compact: { tight: true, smallText: true }
    };

    const s = styles[normalLayout] || styles.standard;

    return (
        <div ref={ref} className={cn(
            "w-full mx-auto aspect-[210/297] bg-white text-gray-800 overflow-hidden flex flex-col",
            s.tight ? "p-6" : "p-10"
        )} style={{ fontFamily: s.serif ? "'Playfair Display', serif" : fontFamily }}>
            
            {/* Header */}
            <header className={cn(
                "mb-8 flex items-center gap-8 p-6 rounded-2xl transition-all",
                s.centered && "flex-col text-center",
                s.reverse && "flex-row-reverse text-right",
                s.gradientHeader && "text-white",
                s.heavyBorder && "border-4"
            )} style={{ 
                background: s.gradientHeader ? `linear-gradient(135deg, ${templateColor}, #000)` : s.headerBg,
                borderColor: s.heavyBorder ? templateColor : 'transparent'
            }}>
                {photoPlacement?.normal && photoPreview && (
                    <div className={cn(
                        "relative flex-shrink-0 overflow-hidden border-4 border-white shadow-md", 
                        shapeClasses[photoShape as keyof typeof shapeClasses] || 'rounded-lg'
                    )} style={{ width: s.largeName ? '150px' : '120px', height: s.largeName ? '150px' : '120px' }}>
                        <Image src={photoPreview} alt={fullName || 'CV Photo'} fill className="object-cover" unoptimized />
                    </div>
                )}
                <div className="flex-grow">
                    <h1 className={cn(
                        "font-black tracking-tighter leading-none",
                        s.largeName ? "text-5xl" : "text-4xl"
                    )} style={{ color: s.gradientHeader ? '#fff' : templateColor }}>
                        {fullName.toUpperCase()}
                    </h1>
                    {finalCurrentJob && <p className={cn("font-bold mt-2", s.gradientHeader ? "text-white/80" : "text-gray-500")}>{finalCurrentJob}</p>}
                    
                    <div className={cn(
                        "flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs font-bold",
                        s.centered ? "justify-center" : s.reverse ? "justify-end" : "justify-start",
                        s.gradientHeader ? "text-white/70" : "text-gray-400"
                    )}>
                        {fullAddress && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {fullAddress}</span>}
                        {email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {email}</span>}
                        {phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {phone}</span>}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={cn(
                "grid gap-8 flex-1",
                s.sidebar || s.split ? "grid-cols-12" : "grid-cols-1"
            )}>
                {/* Body Content */}
                <div className={cn(
                    s.sidebar ? "col-span-8 order-2" : s.split ? "col-span-6" : "col-span-1",
                    "space-y-6"
                )}>
                    {professionalSummary && (
                        <Section title="Summary" color={templateColor} layout={normalLayout}>
                            <p className="text-gray-600 leading-relaxed text-justify">{professionalSummary}</p>
                        </Section>
                    )}

                    {experience && experience.length > 0 && (
                        <Section title="Experience" color={templateColor} layout={normalLayout}>
                            <div className="space-y-5">
                                {experience.map((job, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-black text-gray-800">{job.jobTitle} | {job.company}</h4>
                                            <p className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{job.startDate} - {job.isCurrent ? 'Present' : job.endDate}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{job.city}, {job.country}</p>
                                        <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">{job.duties}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>

                {/* Secondary Content (Sidebar or Split) */}
                <div className={cn(
                    s.sidebar ? "col-span-4 order-1 bg-gray-50 p-6 rounded-2xl" : s.split ? "col-span-6" : "w-full",
                    "space-y-6"
                )}>
                    {education && education.length > 0 && (
                        <Section title="Education" color={templateColor} layout={normalLayout}>
                            <div className="space-y-4">
                                {education.map((edu, index) => (
                                    <div key={index}>
                                        <p className="font-bold text-gray-800">{edu.degree}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{edu.university} | {edu.passingYear}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {skills && skills.length > 0 && (
                        <Section title="Expertise" color={templateColor} layout={normalLayout}>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span key={index} className={cn(
                                        "px-2 py-1 rounded font-bold text-[10px] uppercase",
                                        s.monoSkills ? "font-mono bg-zinc-900 text-primary" : "bg-gray-100 text-gray-600"
                                    )}>{skill}</span>
                                ))}
                            </div>
                        </Section>
                    )}

                    {training && training.length > 0 && (
                        <Section title="Certifications" color={templateColor} layout={normalLayout}>
                            <div className="space-y-2">
                                {training.map((t, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Award className="w-3 h-3 text-primary" />
                                        <div>
                                            <p className="font-bold text-gray-800 leading-tight text-[10px]">{t.title}</p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase">{t.institution}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {(motherLanguage || (languages && languages.length > 0)) && (
                        <Section title="Languages" color={templateColor} layout={normalLayout}>
                            <div className="space-y-3">
                                {motherLanguage && (
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-[10px] uppercase text-gray-400">Native</span>
                                        <span className="font-black text-gray-800">{motherLanguage}</span>
                                    </div>
                                )}
                                {languages && languages.map((lang, index) => (
                                    <div key={index} className="space-y-1 pb-2 border-b border-gray-100 last:border-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-gray-800">{lang.language}</span>
                                            {languageDisplayStyle === 'level' ? 
                                                <span className="text-[10px] font-black text-primary">{lang.listening}</span> : 
                                                <StarRating level={lang.listening} />
                                            }
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px] uppercase text-gray-400 font-bold">
                                            <span>L: {lang.listening}</span>
                                            <span>R: {lang.reading}</span>
                                            <span>SI: {lang.spokenInteraction}</span>
                                            <span>SP: {lang.spokenProduction}</span>
                                            <span>W: {lang.writing}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            </main>

            {declaration && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-700 leading-relaxed text-justify italic">
                        <CheckCircle2 className="inline-block w-3 h-3 mr-1 text-primary" /> {declaration}
                    </p>
                </div>
            )}

            {signaturePlacement?.normal && signatureImage && (
                <div className="mt-6 flex flex-col items-end">
                    <div className="relative w-32 h-16">
                        <Image src={signatureImage} alt="Signature" fill className="object-contain" unoptimized />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 text-center w-32">{fullName}</p>
                </div>
            )}
            
            {qrCodeUrl && (
                <div className="absolute bottom-6 left-6">
                    <Image src={qrCodeUrl} alt="QR" width={40} height={40} className="opacity-20" unoptimized />
                </div>
            )}
        </div>
    );
});

NormalCVPreview.displayName = 'NormalCVPreview';
