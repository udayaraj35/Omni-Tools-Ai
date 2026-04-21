'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAdditionalUserInfo,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Mail, Key } from 'lucide-react';
import Logo from '@/components/ui/logo';
import Link from 'next/link';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.5l-63.8 63.8C324.4 97.4 288.4 80 248 80c-82.6 0-150.2 67.6-150.2 150.2s67.6 150.2 150.2 150.2c90.2 0 134-60.8 138.6-93.4H248v-72.2h239.3c5.3 28.3 8.7 59.3 8.7 93.4z"></path></svg>
);
const FacebookIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V320.7H135.4V256h58.8V202.2c0-58.4 35.7-90.3 87.7-90.3c25 0 46.5 1.8 52.8 2.7v54.4h-32.3c-28.3 0-33.8 13.4-33.8 33.2v43.3h60.4l-7.8 64.7h-52.6V504.5C429.3 476.8 512 376 512 256z"/></svg>
);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleAuthError = (error: any) => {
        let title = 'Authentication Failed';
        let description = error.message;

        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                title = 'Invalid Credentials';
                description = 'The email or password you entered is incorrect.';
                break;
            case 'auth/email-already-in-use':
                title = 'Email Already in Use';
                description = 'This email is already associated with an account. Please sign in instead.';
                break;
            case 'auth/weak-password':
                title = 'Weak Password';
                description = 'Your password must be at least 6 characters long.';
                break;
            case 'auth/popup-closed-by-user':
                title = 'Login Canceled';
                description = 'You closed the login window before completing the process.';
                break;
            case 'auth/internal-error':
                if (error.message.includes('Invalid Secret')) {
                    title = 'Server Configuration Error';
                    description = "FIX: Go to Firebase Console -> Authentication -> Settings -> Blocking Functions and set both dropdowns to (None).";
                }
                break;
            default:
                break;
        }

        toast({ variant: 'destructive', title, description, duration: 9000 });
    };

    const handleAuthSuccess = async (user: FirebaseUser, isNewUser = false, displayName?: string) => {
        if (isNewUser) {
            const userRef = doc(firestore, 'users', user.uid);
            const userData = {
                id: user.uid,
                email: user.email,
                name: displayName || user.displayName || '',
                createdAt: new Date().toISOString(),
                role: 'user',
                phone: '',
                dob: '',
                nationality: '',
                linkedin: '',
                facebook: '',
                whatsapp: '',
                currentJob: '',
                passportNumber: '',
                permanentStreetAddress: '',
                permanentCity: '',
                permanentCountry: '',
                permanentPostalCode: '',
                currentStreetAddress: '',
                currentCity: '',
                currentCountry: '',
                currentPostalCode: '',
                bloodGroup: '',
                gender: '',
                placeOfBirth: '',
                countryOfBirth: '',
                professionalSummary: '',
                skills: [],
                motherLanguage: '',
                experience: [],
                education: [],
                training: [],
                languages: [],
                photoURL: user.photoURL || '',
            };
            try {
                // Use a blocking call to ensure the document is created before redirecting.
                await setDoc(userRef, userData, { merge: true });
                toast({ title: "Account Created!", description: `Welcome, ${displayName || user.displayName || user.email}!` });
                router.push('/profile');
            } catch (error: any) {
                console.error("Failed to create user profile:", error);
                handleAuthError(error);
            }
        } else {
            toast({ title: "Login Successful!", description: `Welcome, ${displayName || user.displayName || user.email}!` });
            router.push('/profile');
        }
    };

    const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const additionalUserInfo = getAdditionalUserInfo(result);
            await handleAuthSuccess(result.user, additionalUserInfo?.isNewUser, result.user.displayName || '');
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            await handleAuthSuccess(userCredential.user);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            await updateProfile(userCredential.user, { displayName: signupName });
            await handleAuthSuccess(userCredential.user, true, signupName);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
             <Link href="/" className="mb-6">
                <Logo className="h-20 w-20"/>
            </Link>
            <Card className="w-full max-w-md glass-card">
                 <Tabs defaultValue="login">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <CardHeader>
                            <CardTitle>Welcome Back!</CardTitle>
                            <CardDescription>Sign in to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-email" type="email" placeholder="you@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" /></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative"><Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-password" type="password" placeholder="••••••••" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" /></div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full gradient-button-gold">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2" />}
                                    Sign In
                                </Button>
                            </form>
                            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div></div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => handleSocialLogin(googleProvider)} disabled={isLoading} variant="outline"><GoogleIcon /> Google</Button>
                                <Button onClick={() => handleSocialLogin(facebookProvider)} disabled={isLoading} variant="outline"><FacebookIcon/> Facebook</Button>
                            </div>
                        </CardContent>
                    </TabsContent>
                    <TabsContent value="signup">
                        <CardHeader>
                            <CardTitle>Create an Account</CardTitle>
                            <CardDescription>Join OmniTools to start creating.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <form onSubmit={handleEmailSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <div className="relative"><UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-name" type="text" placeholder="Your Name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10" /></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-email" type="email" placeholder="you@example.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10" /></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative"><Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-password" type="password" placeholder="••••••••" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10" /></div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full gradient-button-gold">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2"/>}
                                    Sign Up
                                </Button>
                            </form>
                             <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with</span></div></div>
                             <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => handleSocialLogin(googleProvider)} disabled={isLoading} variant="outline"><GoogleIcon /> Google</Button>
                                <Button onClick={() => handleSocialLogin(facebookProvider)} disabled={isLoading} variant="outline"><FacebookIcon /> Facebook</Button>
                            </div>
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
