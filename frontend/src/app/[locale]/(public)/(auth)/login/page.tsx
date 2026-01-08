import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import LoginForm from '@/components/features/auth/LoginForm';
import { Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('login.title'), 
    description: t('login.description'),
  };
}

/**
 * Login page
 * 
 * @see US04 - User login
 */
export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px]">
        <Suspense fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}