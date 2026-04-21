
'use client';

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { verifyAdmin } from '@/app/actions/adminActions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Key, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states - Pre-filled with your provided admin credentials for convenience
  const [email, setEmail] = useState('udayarajkhanal21@gmail.com');
  const [password, setPassword] = useState('Udayaraj35@');

  useEffect(() => {
    // If already logged in and verified as admin, go to dashboard
    if (user && !isUserLoading) {
        router.push('/admin/dashboard');
    }
  }, [isUserLoading, user, router]);

  const handleAuthSuccess = async (user: FirebaseUser) => {
    try {
      // Step 2: Verify server-side admin claims
      await verifyAdmin(user.uid);
      toast({ title: "Access Granted", description: "Welcome to the Admin Control Center." });
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("handleAuthSuccess error:", error);
      // If not an admin, sign them out and show error
      if (auth) {
        await auth.signOut();
      }
      setErrorMsg(error.message || "Access Denied: Administrative privileges required.");
      toast({ variant: "destructive", title: "Access Denied", description: "This account is not authorized." });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
     try {
        // Step 1: Standard Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential.user);
    } catch (error: any) {
        console.error("handleEmailSignIn error:", error);
        let msg = error.message;
        if (error.code === 'auth/invalid-credential') msg = "Invalid admin email or password.";
        if (error.code === 'auth/user-not-found') msg = "Admin account not found.";
        setErrorMsg(msg);
        toast({ variant: "destructive", title: "Login Failed", description: msg });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your admin email." });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Reset Email Sent", description: "Check your inbox for instructions." });
    } catch (error: any) {
      console.error("handleForgotPassword error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0B1020]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0B1020]">
        <Link href="/" className="mb-6 hover:scale-105 transition-transform">
            <Logo className="h-20 w-20"/>
        </Link>
        <Card className="w-full max-w-md glass-card border-primary/20 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-black text-glow-primary tracking-tighter uppercase">Admin Portal</CardTitle>
                <CardDescription className="text-zinc-400">Restricted access for OmniTools AI Admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {errorMsg && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Access Error</AlertTitle>
                        <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300 font-bold uppercase text-[10px] tracking-widest">Admin Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-black/40 border-zinc-800 text-white focus:border-primary" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" title="password" className="text-zinc-300 font-bold uppercase text-[10px] tracking-widest">Password</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 bg-black/40 border-zinc-800 text-white focus:border-primary" required />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-black gradient-button-gold shadow-lg group">
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                LOGIN TO DASHBOARD
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm border-t border-white/5 pt-6">
                <Link href="/" className="text-zinc-500 hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Home
                </Link>
                <Button variant="link" onClick={handleForgotPassword} disabled={isLoading} className="p-0 h-auto text-zinc-500 hover:text-primary transition-colors">
                     Reset Password
                </Button>
            </CardFooter>
        </Card>
        <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-[0.5em] font-bold">Secure Administrative Environment</p>
    </div>
  );
}
