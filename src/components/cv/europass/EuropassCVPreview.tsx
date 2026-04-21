'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { CombinedCVFormData } from '@/app/cv-builder/page';
import { Mail, Phone, Linkedin, Globe, MapPin, Cake, User, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import EuropassLogo from '@/components/ui/europass-logo';

interface EuropassCVPreviewProps {
    allFormValues: CombinedCVFormData;
    photoPreview: string | null;
    signatureImage: string | null;
    qrCodeUrl: string | null;
    templateColor?: string;
    fontFamily?: string;
    europassLayout?: string;
}

const SectionHeader = ({ title, color, icon: Icon, layout }: { title: string, color: string, icon?: any, layout?: string }) => {
    if (layout === 'minimal') {
        return (
            <div className="mt-6 mb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{title}</h3>
                <div className="h-px w-full bg-gray-100 mt-1" />
            </div>
        );
    }
    
    return (
        <div className="mt-6 mb-3 border-b-2 flex items-center gap-2" style={{ borderColor: color }}>
            {Icon && <Icon className="w-4 h-4" style={{ color }} />}
            <h3 className="text-sm font-black uppercase tracking-[0.2em] pb-1" style={{ color }}>{title}</h3>
        </div>
    );
};

const CornerBorders = ({ color }: { color: string }) => (
    <div className="absolute inset-0 pointer-events-none z-50">
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4" style={{ borderColor: color }} />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4" style={{ borderColor: color }} />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4" style={{ borderColor: color }} />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4" style={{ borderColor: color }} />
    </div>
);

export const EuropassCVPreview = forwardRef<HTMLDivElement, EuropassCVPreviewProps>(({ 
    allFormValues, photoPreview, signatureImage, qrCodeUrl, 
    templateColor = '#003366', fontFamily = "sans-serif", europassLayout = 'default' 
}, ref) => {
    const { 
        firstName, lastName, currentJob, phone, email, linkedin, 
        currentStreetAddress, currentCity, currentCountry,
        dob, nationality, professionalSummary,
        experience, education, training, skills, languages, motherLanguage,
        declaration, photoShape, photoPlacement, signaturePlacement
    } = allFormValues;

    const fullName = `${firstName} ${lastName}`;
    const fullAddress = [currentStreetAddress, currentCity, currentCountry].filter(Boolean).join(', ');

    // Layout configuration styles
    const styles: Record<string, any> = {
        default: { headerBg: 'transparent', sidebar: true, border: true },
        'royal-framed': { headerBg: 'transparent', sidebar: true, border: false, framed: true },
        classic: { headerBg: '#f8fafc', sidebar: false, border: false },
        corporate: { headerBg: templateColor, sidebar: false, headerText: '#fff' },
        modern: { headerBg: 'transparent', accentBar: true, iconColor: templateColor },
        minimal: { headerBg: 'transparent', hideIcons: true, textMuted: '#999' },
        executive: { headerBg: '#1a1a1a', headerText: '#d4af37', serif: true },
        technical: { gridSkills: true, accentBorder: templateColor },
        'sidebar-pro': { reverse: true, sidebarBg: '#f1f5f9' },
        compact: { tight: true, smallText: true },
        academic: { expandedEdu: true, topBorder: templateColor }
    };

    const s = styles[europassLayout] || styles.default;

    const renderPhoto = (isSidebar: boolean = false) => {
        // Show photo if explicitly enabled OR if it exists (fallback for better UX)
        if (!photoPreview) return null;
        if (photoPlacement && photoPlacement.europass === false && isSidebar) return null;
        
        return (
            <div className={cn(
                "relative overflow-hidden border-4 border-white shadow-xl z-20",
                photoShape === 'round' ? 'rounded-full' : photoShape === 'oval' ? 'rounded-[50%]' : 'rounded-2xl',
                isSidebar ? "w-full aspect-square mb-6" : "w-28 h-28 md:w-32 md:h-32 flex-shrink-0"
            )}>
                <Image src={photoPreview} alt="Profile" fill className="object-cover" unoptimized />
            </div>
        );
    };

    return (
        <div ref={ref} className={cn(
            "w-full mx-auto aspect-[210/297] bg-white text-black shadow-inner overflow-hidden flex flex-col relative",
            s.tight ? "p-6" : "p-8"
        )} style={{ fontFamily: s.serif ? "'Playfair Display', serif" : fontFamily }}>
            
            {s.framed && <CornerBorders color={templateColor} />}

            {/* 1. Header Section */}
            <div className={cn(
                "relative z-10 flex justify-between items-start mb-8 p-6 rounded-2xl transition-all gap-6",
                europassLayout === 'corporate' && "bg-gray-900 text-white",
                europassLayout === 'executive' && "bg-[#1a1a1a] text-[#d4af37]",
                europassLayout === 'classic' && "bg-gray-50 border-b",
                europassLayout === 'modern' && "border-l-[10px]",
            )} style={{ borderLeftColor: europassLayout === 'modern' ? templateColor : 'transparent' }}>
                
                {/* Photo in Header for layouts without sidebar or when specifically needed in header */}
                {!s.sidebar && europassLayout !== 'sidebar-pro' && renderPhoto(false)}

                <div className="flex-1">
                    <h1 className={cn(
                        "text-4xl font-black tracking-tighter leading-none",
                        europassLayout === 'minimal' ? "text-gray-900" : ""
                    )} style={{ color: s.headerText || templateColor }}>
                        {fullName.toUpperCase() || 'YOUR NAME'}
                    </h1>
                    <p className={cn(
                        "text-lg font-bold mt-2",
                        europassLayout === 'corporate' ? "text-primary" : "text-gray-500"
                    )}>
                        {currentJob || 'Target Job Title'}
                    </p>
                    
                    {!s.sidebar && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[10px] font-bold opacity-70">
                            {email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {email}</span>}
                            {phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {phone}</span>}
                            {fullAddress && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {fullAddress}</span>}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <EuropassLogo className={cn("w-28", (europassLayout === 'corporate' || europassLayout === 'executive') && "filter brightness-0 invert")} />
                    {qrCodeUrl && <div className="p-1 bg-white border rounded-lg shadow-sm"><Image src={qrCodeUrl} alt="QR" width={50} height={50} unoptimized /></div>}
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className={cn(
                "grid grid-cols-12 gap-8 flex-1",
                europassLayout === 'sidebar-pro' && "flex-row-reverse"
            )}>
                {/* Sidebar Column (If layout uses it) */}
                {(s.sidebar || europassLayout === 'sidebar-pro') && (
                    <div className={cn(
                        "col-span-4 space-y-6",
                        europassLayout === 'sidebar-pro' ? "bg-gray-50 p-6 rounded-2xl" : "border-r pr-6"
                    )}>
                        {renderPhoto(true)}

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Contact Details</h4>
                            <div className="space-y-3 text-[11px] font-medium text-gray-600">
                                {email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: templateColor }}/> {email}</p>}
                                {phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: templateColor }}/> {phone}</p>}
                                {linkedin && <p className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" style={{ color: templateColor }}/> LinkedIn</p>}
                                {fullAddress && <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: templateColor }}/> {fullAddress}</p>}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Personal Info</h4>
                            <div className="space-y-3 text-[11px] font-medium text-gray-600">
                                {dob && <p className="flex items-center gap-2"><Cake className="w-3.5 h-3.5" style={{ color: templateColor }}/> {dob}</p>}
                                {nationality && <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" style={{ color: templateColor }}/> {nationality}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Body Column */}
                <div className={cn(
                    s.sidebar || europassLayout === 'sidebar-pro' ? "col-span-8" : "col-span-12",
                    "space-y-6"
                )}>
                    {professionalSummary && (
                        <div>
                            <SectionHeader title="About Me" color={templateColor} icon={User} layout={europassLayout} />
                            <p className="text-xs leading-relaxed text-gray-700 text-justify">{professionalSummary}</p>
                        </div>
                    )}

                    {experience && experience.length > 0 && (
                        <div>
                            <SectionHeader title="Work Experience" color={templateColor} icon={Briefcase} layout={europassLayout} />
                            <div className="space-y-5">
                                {experience.map((job, i) => (
                                    <div key={i} className="relative pl-5 border-l-2 border-gray-100 transition-all hover:border-primary/30">
                                        <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-white border-2" style={{ borderColor: templateColor }} />
                                        <p className="text-xs font-black text-gray-900">{job.jobTitle.toUpperCase()}</p>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mt-0.5">
                                            <span>{job.company}</span>
                                            <span className="bg-gray-50 px-2 py-0.5 rounded italic">{job.startDate} — {job.isCurrent ? 'Present' : job.endDate}</span>
                                        </div>
                                        <p className="text-[10px] mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">{job.duties}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {education && education.length > 0 && (
                        <div>
                            <SectionHeader title="Education" color={templateColor} icon={GraduationCap} layout={europassLayout} />
                            <div className="grid grid-cols-1 gap-4">
                                {education.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-800">{edu.degree}</p>
                                            <p className="text-[10px] text-gray-500 font-bold">{edu.university}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black border-gray-200">{edu.passingYear}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {training && training.length > 0 && (
                        <div>
                            <SectionHeader title="Certifications" color={templateColor} layout={europassLayout} />
                            <div className="grid grid-cols-2 gap-3">
                                {training.map((t, i) => (
                                    <div key={i} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-800">{t.title}</p>
                                        <p className="text-[9px] text-gray-500">{t.institution}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <SectionHeader title="Languages" color={templateColor} layout={europassLayout} />
                        <div className="space-y-4">
                            {motherLanguage && (
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
                                    <span className="text-[10px] font-black uppercase text-gray-500">Mother Tongue</span>
                                    <span className="text-[11px] font-black text-primary">{motherLanguage}</span>
                                </div>
                            )}
                            
                            {languages && languages.length > 0 && (
                                <table className="w-full text-[9px] border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 font-black uppercase tracking-tighter">
                                            <th className="p-1.5 text-left border">Other Language</th>
                                            <th className="p-1.5 text-center border">Listen</th>
                                            <th className="p-1.5 text-center border">Read</th>
                                            <th className="p-1.5 text-center border">Interact</th>
                                            <th className="p-1.5 text-center border">Produce</th>
                                            <th className="p-1.5 text-center border">Write</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {languages.map((l, i) => (
                                            <tr key={i} className="text-center font-bold text-gray-700">
                                                <td className="p-1.5 text-left border bg-gray-50 font-black">{l.language}</td>
                                                <td className="p-1.5 border">{l.listening}</td>
                                                <td className="p-1.5 border">{l.reading}</td>
                                                <td className="p-1.5 border">{l.spokenInteraction}</td>
                                                <td className="p-1.5 border">{l.spokenProduction}</td>
                                                <td className="p-1.5 border">{l.writing}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {skills && skills.length > 0 && (
                        <div>
                            <SectionHeader title="Technical Skills" color={templateColor} layout={europassLayout} />
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[9px] font-bold uppercase tracking-wider">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {declaration && (
                        <div className="mt-auto pt-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-[9px] font-bold text-gray-800 leading-relaxed text-justify">
                                    <CheckCircle2 className="inline-block w-3 h-3 mr-1 text-primary" /> {declaration}
                                </p>
                            </div>
                            
                            {signaturePlacement?.europass && signatureImage && (
                                <div className="mt-6 flex flex-col items-end">
                                    <div className="relative w-32 h-16">
                                        <Image src={signatureImage} alt="Signature" fill className="object-contain" unoptimized />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1 border-t w-32 text-center pt-1">{fullName}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer Watermark */}
            <div className="mt-auto pt-4 flex justify-center opacity-20 select-none grayscale">
                <p className="text-[8px] font-black uppercase tracking-[0.5em]">Digitally Verified • OmniTools AI</p>
            </div>
        </div>
    );
});

EuropassCVPreview.displayName = 'EuropassCVPreview';
