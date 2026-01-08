import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DownloadPageClient from './DownloadPageClient';
import { env } from '@/config/env';

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Download' });

  return {
    title: t('page_title'),
    description: t('page_description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Retrieves file metadata from the internal API
 */
async function getFileMetadata(token: string) {
  try {
    // Direct container-to-container call (very fast, no network latency)
    const res = await fetch(`${env.INTERNAL_API_URL}/files/${token}/metadata`, {
      cache: 'no-store', // Important: we want the real-time expiration status
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 404) return null;
    
    if (!res.ok) {
      console.error(`Metadata fetch failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Network error fetching metadata:', error);
    return null;
  }
}

/**
 * Public download page
 * Executed on the server (Node.js) in the Frontend container
 * * @see US02 - Download via link
 */
export default async function DownloadPage({ params }: Props) {
  const { token } = await params;

  // Real data recovery
  const metadata = await getFileMetadata(token);
  
  // 404 error handling (Redirection to Not Found page if file does not exist)
  if (!metadata) {
    notFound();
  }

  // Calculating the status for the UI
  const expiresAt = new Date(metadata.expirationDate);
  const now = new Date();
  
  // We also check the expiration on the front end for security reasons (in addition to the back end)
  const isExpired = now > expiresAt;

  let status: 'password_required' | 'ready' | 'expiring_soon' | 'expired' = 'ready';

  if (isExpired) {
    status = 'expired';
  } else if (metadata.hasPassword) {
    status = 'password_required';
  } else {
    const oneDay = 24 * 60 * 60 * 1000;
    if (expiresAt.getTime() - now.getTime() < oneDay) {
      status = 'expiring_soon';
    }
  }

  // Constructing the FileInfo object for the Client component
  // Note: The internal ID is not public; the token is used as the unique ID for the UI
  const fileInfo = {
    id: token, 
    name: metadata.name,
    size: metadata.size,
    expiresAt: expiresAt,
    hasPassword: metadata.hasPassword,
    status: status,
    token: token,
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px]">
        <DownloadPageClient file={fileInfo} />
      </div>
    </div>
  );
}