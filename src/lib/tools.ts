import { 
  FileText, BookUser, ImageIcon, Pencil, 
  Bot, Wrench, Video, Sparkles, 
  ShieldCheck, Languages, 
  Scan, FileDown, Combine, Scissors, 
  Landmark, 
  Calendar, CreditCard, Receipt, Star, User, MessageSquare, Zap, ClipboardList,
  LayoutTemplate, Search, Eraser, CaseUpper, Code, ArrowRight, QrCode, Plane,
  Library, PenTool, Gift, Camera, Stamp, DollarSign, FileUser, Mail, FileMinus, 
  Briefcase, UserCheck, BookOpen, ImagePlus, Type
} from 'lucide-react';
import { doc, updateDoc, increment, setDoc, getFirestore } from 'firebase/firestore';

export interface ToolDefinition {
  name: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  tag?: string;
  flag?: string;
}

export const categoryTheme: Record<string, { color: string, border: string, bg: string }> = {
  "नेपाली युटिलिटी हब": { color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  "Visa & Travel Hub": { color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  "Career & Professional": { color: "text-indigo-500", border: "border-indigo-500/20", bg: "bg-indigo-500/10" },
  "AI Content & Writing": { color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  "AI Image & Design": { color: "text-pink-500", border: "border-pink-500/20", bg: "bg-pink-500/10" },
  "PDF & Media Utils": { color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/10" },
  "Smart AI Assistants": { color: "text-purple-500", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  "Text & Font Stylist": { color: "text-orange-500", border: "border-orange-500/20", bg: "bg-orange-500/10" },
};

export const toolCategories: Record<string, ToolDefinition[]> = {
  "नेपाली युटिलिटी हब": [
     {
      name: 'Mantra Library',
      description: 'Mantras, stories, and aartis collection.',
      href: '/mantra-generator',
      icon: Library,
      color: 'text-amber-500',
      flag: 'nepal',
    },
    {
      name: 'Smart Nivedan',
      description: 'Formal Nepali application letters.',
      href: '/nivedan-patra',
      icon: PenTool,
      color: 'text-amber-500',
      flag: 'nepal',
    },
    {
      name: 'Invitation Studio',
      description: 'Smart, animated Wedding & Bratabandha invites.',
      href: '/invitation-studio',
      icon: Gift,
      color: 'text-amber-500',
      tag: 'Premium',
      flag: 'nepal',
    },
    {
      name: 'Date Intelligence',
      description: 'Nepali to English date and age converter.',
      href: '/bs-ad-converter',
      icon: Calendar,
      color: 'text-amber-500',
      flag: 'nepal',
    },
    {
      name: 'Tax Clearance',
      description: 'Official tax clearance certificate generator.',
      href: '/tax-clearance',
      icon: Receipt,
      color: 'text-amber-500',
      flag: 'nepal',
    },
  ],
  "Visa & Travel Hub": [
    {
      name: 'QR Studio Pro',
      description: 'Design beautiful, multi-link QR codes.',
      href: '/qr-studio',
      icon: QrCode,
      color: 'text-blue-500',
      tag: 'New'
    },
    {
      name: 'SWIFT/BIC Finder',
      description: 'Global bank code finder and structural checker.',
      href: '/swift-tool',
      icon: Landmark,
      color: 'text-blue-500',
      tag: 'Finance'
    },
    {
      name: 'Dummy Ticket',
      description: 'Get verifiable flight reservations for visas.',
      href: '/dummy-ticket',
      icon: Plane,
      color: 'text-blue-500',
      tag: 'Verified'
    },
    {
      name: 'AI Passport Photo',
      description: 'Official biometric photos for 50+ countries.',
      href: '/passport-photo-generator',
      icon: Camera,
      color: 'text-blue-500',
      tag: 'New'
    },
    {
      name: 'Permit Application',
      description: 'Complete temporary residence permit forms.',
      href: '/temporary-residence-permit',
      icon: Stamp,
      color: 'text-blue-500',
    },
    {
      name: 'Currency Live',
      description: 'Real-time foreign exchange rate calculator.',
      href: '/currency-converter',
      icon: DollarSign,
      color: 'text-blue-500',
    },
  ],
  "Career & Professional": [
    {
      name: 'Europass CV Builder',
      description: 'The international standard for global job markets.',
      href: '/cv-builder?type=europass',
      icon: FileUser,
      color: 'text-indigo-500',
      tag: 'Official'
    },
    {
      name: 'Modern CV Builder',
      description: 'Clean, stylish & creative professional resumes.',
      href: '/cv-builder?type=normal',
      icon: FileUser,
      color: 'text-indigo-500',
      tag: 'Premium'
    },
    {
      name: 'ATS Sharp Builder',
      description: 'Machine-readable resumes optimized for HR systems.',
      href: '/cv-builder?type=ats',
      icon: FileUser,
      color: 'text-indigo-500',
      tag: 'HR-Ready'
    },
    {
      name: 'AI Cover Letter',
      description: 'Tailored letters for job applications.',
      href: '/visa-builder',
      icon: Mail,
      color: 'text-indigo-500',
    },
    {
      name: 'Resignation Maker',
      description: 'Draft polite and professional resignation letters.',
      href: '/resignation-letter',
      icon: FileMinus,
      color: 'text-indigo-500',
    },
    {
      name: 'Proposal Gen',
      description: 'Professional business and project proposals.',
      href: '/proposal-generator',
      icon: Briefcase,
      color: 'text-indigo-500',
    },
    {
      name: 'Invoice Pro',
      description: 'Create and track business invoices.',
      href: '/invoice-generator',
      icon: Receipt,
      color: 'text-indigo-500',
    },
    {
      name: 'Company Doc Gen',
      description: 'NOC, Salary Certificates, and more.',
      href: '/company-documents',
      icon: ShieldCheck,
      color: 'text-indigo-500',
    },
  ],
  "AI Content & Writing": [
    {
      name: 'OmniHumanizer',
      description: 'Bypass AI detectors with natural rewriting.',
      href: '/omnihumanizer',
      icon: UserCheck,
      color: 'text-emerald-500',
      tag: 'Viral'
    },
    {
      name: 'AI Story Gen',
      description: 'Turn your creative ideas into unique stories.',
      href: '/story-generator',
      icon: BookOpen,
      color: 'text-emerald-500',
    },
    {
      name: 'Social Writer',
      description: 'Viral posts, captions, and hashtags.',
      href: '/social-writer',
      icon: MessageSquare,
      color: 'text-emerald-500',
    },
    {
      name: 'AI Translator',
      description: 'Accurate translation in 25+ languages.',
      href: '/translation',
      icon: Languages,
      color: 'text-emerald-500',
    },
  ],
  "AI Image & Design": [
    {
      name: 'Smart Card Maker',
      description: 'Custom cards for Dashain, Tihar, Birthdays.',
      href: '/goldify-ai',
      icon: Sparkles,
      color: 'text-pink-500',
    },
    {
      name: 'BG Remover',
      description: 'Erase image backgrounds with one click.',
      href: '/background-remover',
      icon: Eraser,
      color: 'text-pink-500',
    },
    {
      name: 'AI Image Gen',
      description: 'Generate stunning art from text descriptions.',
      href: '/image-generator',
      icon: ImagePlus,
      color: 'text-pink-500',
    },
    {
      name: 'Watermark Pro',
      description: 'Secure your images and PDFs easily.',
      href: '/story-designer',
      icon: ShieldCheck,
      color: 'text-pink-500',
    },
  ],
  "PDF & Media Utils": [
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDFs into one.',
      href: '/pdf-tools',
      icon: Combine,
      color: 'text-red-500',
    },
    {
      name: 'Split PDF',
      description: 'Extract specific pages from any PDF.',
      href: '/pdf-tools',
      icon: Scissors,
      color: 'text-red-500',
    },
    {
      name: 'Media Optimizer',
      description: 'Smart compression for videos and HEIC.',
      href: '/media-optimizer',
      icon: Zap,
      color: 'text-red-500',
    },
  ],
  "Smart AI Assistants": [
    {
      name: 'Omni General',
      description: 'Your 24/7 intelligent query companion.',
      href: '/omni-ai',
      icon: Bot,
      color: 'text-purple-500',
    },
    {
      name: 'Personal AI',
      description: 'A tailored conversational experience.',
      href: '/personal-assistant',
      icon: User,
      color: 'text-purple-500',
    },
    {
      name: 'AI Code Help',
      description: 'Instant debugging and coding solutions.',
      href: '/code-assistant',
      icon: Code,
      color: 'text-purple-500',
    },
  ],
  "Text & Font Stylist": [
    {
      name: 'Font Stylist',
      description: 'Beautiful decorative fonts for bios.',
      href: '/fancy-font-generator',
      icon: Type,
      color: 'text-orange-500',
    },
    {
      name: 'Case Converter',
      description: 'UPPER, lower, Sentence, Title cases.',
      href: '/text-converter',
      icon: CaseUpper,
      color: 'text-orange-500',
    },
  ],
};

export const allToolsList = Object.values(toolCategories).flat();

/**
 * Tracks usage of a specific tool.
 * @param toolHref The relative path of the tool.
 */
export async function trackToolUsage(toolHref: string) {
  const firestore = getFirestore();
  const toolId = toolHref.split('?')[0].replace('/', '') || 'home';
  const statsRef = doc(firestore, 'toolStats', toolId);

  try {
    await setDoc(statsRef, { 
      href: toolHref,
      clicks: increment(1),
      lastUsed: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error("Tracking failed:", e);
  }
}
