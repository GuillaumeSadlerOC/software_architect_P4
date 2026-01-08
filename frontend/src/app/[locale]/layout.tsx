import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { siteConfig } from "@/config/site";
import { localeConfig, Locale } from "@/config/i18n";
import StoreProvider from "@/components/providers/StoreProvider";
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

// FONT CONFIGURATION
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
  display: "swap",
});

// VIEWPORT CONFIGURATION
export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// GLOBAL SEO CONFIGURATION
type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;

  // Retrieving SEO translations (Namespace: GlobalSeo)
  const t = await getTranslations({locale, namespace: 'GlobalSeo'});

  // Security type for access to localeConfig
  const currentLocale = locale as Locale;
  const isoLocale = localeConfig[currentLocale]?.iso || 'fr_FR';

  return {

    // Basic Metadata
    title: {
      template: `%s | ${t('site_name')}`,
      default: t('site_name'),
    },
    description: t('description'),
    applicationName: t('application_name'),
    authors: [{ name: t('creator') }],
    creator: t('creator'),
    publisher: t('publisher'),
  
    // Base URL (Canonical)
    metadataBase: new URL(siteConfig.url),

    // Keywords
    keywords: t('keywords').split(',').map(k => k.trim()),

    // Robots
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

    // Open Graph
    openGraph: {
      siteName: t('site_name'),
      title: t('site_name'),
      description: t('description'),
      locale: isoLocale,
      type: 'website',
      url: siteConfig.url,
      images: [
        {
          url: siteConfig.ogImage, 
          width: 1200,
          height: 630,
          alt: t('site_name'),
        },
      ],
    },

    // Manifest
    manifest: '/favicons/site.webmanifest',

    // Favicons
    icons: {

      // The modern standard (SVG): Perfect sharpness everywhere
      icon: [
        { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicons/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],

      // The fallback for old browsers / Windows shortcuts
      shortcut: '/favicons/favicon.ico',

      // For iPhone/iPad
      apple: [
        { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],

      other: {
        rel: 'mask-icon',
        url: '/favicons/safari-pinned-tab.svg',
        color: siteConfig.themeColor,
      },
      
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Local Security Check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // i18n messages
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${dmSans.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        <StoreProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position="bottom-center" />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}