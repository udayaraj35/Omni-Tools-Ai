
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { LayoutClient } from '@/components/ui/layout-client';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

const APP_NAME = "OmniTools AI";
const APP_DEFAULT_TITLE = "OmniTools AI - 100+ Free AI & Utility Tools Online";
const APP_DESCRIPTION = "Explore OmniTools AI for free AI tools like Europass CV Builder, AI Humanizer, Background Remover, Nepali Date Converter, and 100+ professional utilities. Fast, secure, and no sign-up required.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: "%s | OmniTools AI",
  },
  description: APP_DESCRIPTION,
  keywords: ["AI Tools", "Free CV Builder", "Europass CV", "AI Humanizer", "Background Remover", "Nepali Date Converter", "Mantra Library", "Digital Utilities", "Online Document Editor", "Passport Photo Generator"],
  authors: [{ name: 'Udaya Raj Khanal' }],
  creator: 'Udaya Raj Khanal',
  metadataBase: new URL('https://omnitoolsai.fun'),
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    url: "https://omnitoolsai.fun",
    images: [
      {
        url: "https://i.imgur.com/jx67IkZ.png",
        width: 1200,
        height: 630,
        alt: "OmniTools AI Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: ["https://i.imgur.com/jx67IkZ.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="google-adsense-account" content="ca-pub-5316090866649021" />
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5316090866649021"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "OmniTools AI",
              "operatingSystem": "Web",
              "applicationCategory": "UtilityApplication, MultimediaApplication",
              "description": APP_DESCRIPTION,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Udaya Raj Khanal"
              }
            })
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden transition-colors duration-300">
          <FirebaseClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <LayoutClient>{children}</LayoutClient>
              <Toaster />
              <CookieBanner />
            </ThemeProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
