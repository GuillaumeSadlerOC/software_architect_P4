'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error.boundary');

  useEffect(() => {
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-6 p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 animate-in zoom-in-95">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          {t('description')}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="default" className="gap-2 shadow-sm">
          <RefreshCw className="h-4 w-4" />
          {t('retry')}
        </Button>
        
        <Button asChild variant="outline" className="gap-2 bg-white">
          <Link href="/">
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>
        </Button>
      </div>
    </div>
  );
}