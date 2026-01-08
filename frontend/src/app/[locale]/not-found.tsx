'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('Error.not_found');

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-6 p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 shadow-sm">
        <FileQuestion className="h-10 w-10 text-slate-400" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="text-slate-500 max-w-md text-center">
          {t('description')}
        </p>
      </div>
      <Button asChild className="shadow-md">
        <Link href="/">{t('action')}</Link>
      </Button>
    </div>
  );
}