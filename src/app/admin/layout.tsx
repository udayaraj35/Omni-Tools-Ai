'use client';

import React, { useEffect } from "react";
import { useAuth, useUser, FirebaseClientProvider } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const normalizedPath = pathname?.toLowerCase().replace(/\/$/, "") || "";
  const isLoginPage = normalizedPath === "/admin/login";

  useEffect(() => {
    if (!isUserLoading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isUserLoading, user, isLoginPage, router]);

  const logout = async () => {
    try {
        await signOut(auth);
        toast({ title: "Logged out successfully." });
        router.push("/admin/login");
    } catch (error: any) {
        console.error("logout error:", error);
        toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    }
  };

  if (isUserLoading && !isLoginPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-6 z-50">
          <div className="flex items-center gap-2 font-black uppercase tracking-tighter italic">
              <Logo className="h-8 w-8" />
              <span className="hidden sm:inline">OmniTools Admin</span>
          </div>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="ml-auto flex items-center gap-4">
                  <Button asChild variant="ghost" className="hidden sm:flex font-black uppercase text-[10px] tracking-widest gap-2">
                      <Link href="/"><ArrowLeft className="h-3 w-3" /> Back to Site</Link>
                  </Button>
                  <Button onClick={logout} variant="ghost" size="icon" aria-label="Logout" className="text-muted-foreground hover:text-red-500">
                      <LogOut className="h-5 w-5" />
                  </Button>
              </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </FirebaseClientProvider>
    );
}
