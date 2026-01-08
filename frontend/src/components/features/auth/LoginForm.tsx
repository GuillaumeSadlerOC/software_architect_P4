'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';

import { useLoginMutation } from '@/lib/store/features/auth/authApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/features/auth/authSlice';
import { LoginSchema, loginSchema } from '@/schemas/identity.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

/**
 * Login form
 * * @see US04 - User login
 */
export default function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const redirectUrl = searchParams.get('redirect');
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl || '/dashboard');
    }
  }, [isAuthenticated, router, redirectUrl]);

  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginSchema) => {
    setErrorMessage(null);
    try {
      await login(values).unwrap();
      router.push(redirectUrl || '/dashboard');
    } catch (err: any) {
      const error = err as { status?: number };
      if (error.status === 401) {
        setErrorMessage(t('login.errors.invalid_credentials'));
      } else if (error.status === 400) {
        setErrorMessage(t('login.errors.bad_request'));
      } else {
        setErrorMessage(t('login.errors.server_error'));
      }
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card shadow-card rounded-2xl p-6 space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display text-[28px] font-bold leading-10 text-card-foreground">
          {t('login.title')}
        </h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-label font-normal text-base leading-6">
                  {t('login.fields.email')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('login.placeholders.email')}
                    type="email" 
                    autoComplete="username"
                    disabled={isLoading}
                    className="h-10 bg-input border-border rounded-lg px-4 text-foreground placeholder:text-muted-foreground"
                    {...field} 
                  />
                </FormControl>
                
                {fieldState.error?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {t(`validation.${fieldState.error.message}`)}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-label font-normal text-base leading-6">
                  {t('login.fields.password')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('login.placeholders.password')}
                    type="password" 
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-10 bg-input border-border rounded-lg px-4 text-foreground placeholder:text-muted-foreground"
                    {...field} 
                  />
                </FormControl>
                
                {fieldState.error?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {t(`validation.${fieldState.error.message}`)}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-2">
            {/* Link Create an account */}
            <Link 
              href="/register"
              className="text-base text-accent hover:text-accent/80 hover:underline transition-colors"
            >
              {t('login.create_account')}
            </Link>

            {/* Login button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-normal text-base rounded-lg bg-secondary/50 border border-secondary-border text-secondary-foreground hover:bg-secondary/70"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('login.submit')}
            </Button>
          </div>
          
        </form>
      </Form>
    </div>
  );
}