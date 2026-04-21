'use client';
import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Facebook, Twitter, Youtube, Shield, FileText, CheckCircle, Mail, Globe, ArrowRight, Instagram } from 'lucide-react';
import Logo from '../ui/logo';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LandingFooterProps {
  onNavigate: (section: string) => void;
}

export function LandingFooter({ onNavigate }: LandingFooterProps) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  if (isEmbed) return null;

  return (
    <footer className="relative border-t border-border bg-muted/20 pt-12 pb-8 overflow-hidden">
        {/* Subtle glow - preserved but reduced */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-primary/5 blur-[80px] rounded-full pointer-events-none opacity-50"></div>

        <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                
                {/* Branding Column */}
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Logo className="h-8 w-8" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase text-foreground">OmniTools AI</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium max-w-xs">
                        A comprehensive suite of 100+ AI-powered utilities. Professional, fast, and free for the global community.
                    </p>
                    <div className="flex items-center gap-3">
                        {[
                            { icon: Facebook, href: 'https://www.facebook.com/udayarajkhanal369' },
                            { icon: Instagram, href: '#' },
                            { icon: Twitter, href: 'https://twitter.com/udayarajkhanal' },
                            { icon: Youtube, href: 'https://youtube.com/@UdayaRajKhanal' }
                        ].map((social, i) => (
                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border shadow-sm">
                                <social.icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>
                
                {/* Tools Column */}
                <div className="space-y-4 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Quick Access</h4>
                    <ul className="space-y-2">
                        {[
                            { label: 'CV Builder', path: '/cv-builder' },
                            { label: 'Cover Letter', path: '/visa-builder' },
                            { label: 'AI Humanizer', path: '/omnihumanizer' },
                            { label: 'PDF Suite', path: '/pdf-tools' },
                            { label: 'All Tools', path: '/all-tools' }
                        ].map((link) => (
                            <li key={link.label}>
                                <Link href={link.path} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center group">
                                    <span className="h-px w-0 group-hover:w-2 bg-primary mr-0 group-hover:mr-1.5 transition-all"></span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal Column */}
                <div className="space-y-4 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Governance</h4>
                    <ul className="space-y-2">
                        {[
                            { label: 'Privacy Policy', icon: Shield, path: '/privacy' },
                            { label: 'Terms of Service', icon: FileText, path: '/terms' },
                            { label: 'About Us', icon: CheckCircle, path: '/about' },
                            { label: 'Contact Help', icon: Mail, path: '/contact' }
                        ].map((link) => (
                            <li key={link.path}>
                                <Link href={link.path} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                                    <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Creator Column - Compact */}
                <div className="bg-muted/50 border border-border rounded-2xl p-6 flex flex-col items-center text-center space-y-3 shadow-md max-w-xs lg:max-w-none mx-auto lg:mx-0 w-full">
                    <div className="relative">
                        <Image
                            src="https://i.imgur.com/KWh3A5y.png"
                            alt="Udaya Raj Khanal"
                            width={60}
                            height={60}
                            className="rounded-full border-2 border-primary/20 shadow-lg"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-3 w-3 rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-0.5">Lead Architect</p>
                        <h5 className="font-black text-sm text-foreground">UDAYA RAJ KHANAL</h5>
                    </div>
                    <Button asChild size="sm" className="gradient-button-gold w-full rounded-lg h-8 text-[10px]">
                        <a href="https://www.facebook.com/udayarajkhanal369" target="_blank" rel="noopener noreferrer">
                            Connect <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                    </Button>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    © {new Date().getFullYear()} OMNITOOLS AI. ENGINEERED FOR EXCELLENCE.
                </p>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Global Node</span>
                    <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Secure SSL</span>
                </div>
            </div>
        </div>
    </footer>
  );
}
