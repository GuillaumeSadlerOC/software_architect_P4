'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAppDispatch } from '@/lib/store/hooks';
import { logOut } from '@/lib/store/features/auth/authSlice';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Logout page
 * 
 * Cleans the Redux state and redirects to login
 */
export default function LogoutPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(logOut());

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 800);

    return () => clearTimeout(timer);
  }, [dispatch, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
      <p className="text-white text-base">
        {t('logout.message')}
      </p>
    </div>
  );
}