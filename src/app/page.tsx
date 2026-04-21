
'use client';
import { Home } from '@/components/landing/Home';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();
    
    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) {
            router.push(path);
        } else {
            const section = document.getElementById(path);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                 // Let Home.tsx handle dialogs. For other paths from other pages, this will navigate.
                 router.push(`/${path}`);
            }
        }
    };
    
  return <Home onNavigate={handleNavigate} />;
}
