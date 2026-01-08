import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RegisterForm from '@/components/features/auth/RegisterForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('register.title'),
    description: t('register.description'),
  };
}

/**
 * Registration page
 * 
 * @see US03 - Account creation
 */
export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px]">
        <RegisterForm />
      </div>
    </div>
  );
}