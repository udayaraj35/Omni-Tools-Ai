"use client";

import * as React from 'react';
import Logo from '@/components/ui/logo';
import { Button } from '../ui/button';
import { Home, Menu, LayoutGrid, FileText, User, LogOut, Sparkles, ChevronDown, Search, CaseUpper, Languages, LogIn, Sun, Moon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '../ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { clearUserSessionData } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

const mainNav = [
    { id: '/cv-builder', label: 'CV Builder', icon: FileText },
    { id: '/dummy-ticket', label: 'Tickets', icon: Sparkles },
    { id: '/omnihumanizer', label: 'Humanizer', icon: User },
    { id: '/text-converter', label: 'Case Converter', icon: CaseUpper },
    { id: '/swift-tool', label: 'SWIFT Finder', icon: Search },
];

export function Navbar({ onNavigate }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // If embed mode is active, don't render the navbar
  const isEmbed = searchParams.get('embed') === 'true';

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLogout = async () => {
      try {
          await signOut(auth);
          clearUserSessionData();
          toast({ title: 'Logged out successfully.', description: 'Session data auto-cleaned.' });
          router.push('/');
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
      }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (isEmbed) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center gap-4">
          <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background border-border">
                <SheetHeader className="mb-8 border-b border-border pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Logo className="h-8 w-8" />
                    <span className="font-black text-lg">OmniTools AI</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  <SheetClose asChild>
                    <Button variant="ghost" onClick={() => onNavigate('home')} className="justify-start h-12 font-bold text-muted-foreground hover:text-primary rounded-xl">
                       <Home className="mr-3 h-5 w-5"/> Home
                   </Button>
                  </SheetClose>
                  {mainNav.map((link) => (
                     <SheetClose asChild key={link.id}>
                        <Button variant="ghost" onClick={() => onNavigate(link.id)} className="justify-start h-12 font-bold text-muted-foreground hover:text-primary rounded-xl">
                           <link.icon className="mr-3 h-5 w-5"/> {link.label}
                       </Button>
                     </SheetClose>
                  ))}
                   <SheetClose asChild>
                    <Button variant="ghost" onClick={() => onNavigate('/all-tools')} className="justify-start h-12 font-bold text-muted-foreground hover:text-primary rounded-xl">
                       <LayoutGrid className="mr-3 h-5 w-5"/> All Tools
                   </Button>
                  </SheetClose>
                   <div className="mt-4 pt-4 border-t border-border">
                   {user ? (
                        <>
                            <SheetClose asChild>
                                <Button variant="ghost" onClick={() => router.push('/profile')} className="w-full justify-start h-12 font-bold text-muted-foreground hover:text-primary rounded-xl">
                                    <User className="mr-3 h-5 w-5"/> Profile
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start h-12 font-bold text-red-500 hover:bg-red-500/10 rounded-xl">
                                    <LogOut className="mr-3 h-5 w-5"/> Logout & Clean
                                </Button>
                            </SheetClose>
                        </>
                   ) : (
                    <SheetClose asChild>
                        <Button variant="ghost" onClick={() => router.push('/login')} className="w-full justify-start h-12 font-bold text-primary hover:bg-primary/10 rounded-xl">
                            <LogIn className="mr-3 h-5 w-5"/> Login / Sign Up
                        </Button>
                    </SheetClose>
                   )}
                   </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group px-2">
                <div className="p-1.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all border border-primary/10">
                    <Logo className="h-8 w-8" />
                </div>
                <span className="font-black text-lg tracking-tight uppercase hidden sm:block py-1">OmniTools AI</span>
            </button>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted p-1 rounded-2xl border border-border">
            {mainNav.map(link => (
                <Button key={link.id} variant="ghost" onClick={() => onNavigate(link.id)} className="font-bold text-muted-foreground hover:text-foreground px-4 rounded-xl transition-all">
                    {link.label}
                </Button>
            ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground px-4 rounded-xl gap-2">
                        More <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card border-border w-48">
                    <DropdownMenuItem onClick={() => onNavigate('/all-tools')} className="font-bold py-3 cursor-pointer"><LayoutGrid className="mr-2 h-4 w-4" /> All Tools</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('/pdf-tools')} className="font-bold py-3 cursor-pointer"><FileText className="mr-2 h-4 w-4" /> PDF Tools</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('/translation')} className="font-bold py-3 cursor-pointer"><Languages className="mr-2 h-4 w-4" /> AI Translator</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
           {/* Theme Toggle */}
           <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
           </Button>

           {isUserLoading ? (
               <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
           ) : user ? (
               <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="p-0 h-10 w-10 rounded-full bg-muted border border-border hover:ring-2 ring-primary/50 transition-all overflow-hidden">
                           {user.photoURL ? <Image src={user.photoURL} alt="User" width={40} height={40} className="object-cover" /> : <User className="h-5 w-5" />}
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="glass-card border-border w-56">
                       <DropdownMenuItem onClick={() => router.push('/profile')} className="font-bold py-3 cursor-pointer"><User className="mr-2 h-4 w-4" /> My Profile</DropdownMenuItem>
                       <DropdownMenuItem onClick={handleLogout} className="font-bold py-3 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"><LogOut className="mr-2 h-4 w-4" /> Logout & Clean</DropdownMenuItem>
                   </DropdownMenuContent>
               </DropdownMenu>
           ) : (
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.push('/login')} variant="ghost" className="font-bold text-muted-foreground hover:text-foreground rounded-xl hidden sm:flex">
                        Log In
                    </Button>
                    <Button onClick={() => router.push('/login')} size="icon" variant="ghost" className="sm:hidden text-primary">
                        <LogIn className="h-5 w-5" />
                    </Button>
                </div>
           )}
        </div>
      </div>
    </header>
  );
}
