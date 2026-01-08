'use client';

import { useAppDispatch } from '@/lib/store/hooks';
import { logOut } from '@/lib/store/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ErrorPage() {
  const t = useTranslations('Error.server_error');
  const dispatch = useAppDispatch();

  const handleRetry = () => {
    // We redirect to the root directory, which will reload the app (Hard Reload)
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    dispatch(logOut());
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-red-100 shadow-xl bg-white/90 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
              <WifiOff className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-base pt-2">
            {t('description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center text-sm text-muted-foreground">
          <p className="font-mono bg-slate-100 py-1 px-2 rounded inline-block">
            {t('details')}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleRetry} size="lg" className="w-full gap-2 shadow-md">
            <RefreshCw className="h-4 w-4" />
            {t('actions.retry')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            {t('actions.logout')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}