'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useRegisterMutation } from '@/lib/store/features/auth/authApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/features/auth/authSlice';
import { RegisterSchema, registerSchema } from '@/schemas/identity.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

export default function RegisterForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (values: RegisterSchema) => {
    setErrorMessage(null);
    try {
      await register({
        email: values.email,
        password: values.password,
      }).unwrap();

      toast.success(t('register.success'));
      router.push('/login');
    } catch (err: any) {
      if (err.status === 409) {
        setErrorMessage(t('register.errors.email_taken'));
      } else if (err.status === 400) {
        setErrorMessage(t('register.errors.bad_request'));
      } else {
        setErrorMessage(t('register.errors.server_error'));
      }
      console.error('Registration failed', err);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card shadow-card rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="font-display text-[28px] font-bold leading-10 text-card-foreground">
          {t('register.title')}
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
                  {t('register.fields.email')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('register.placeholders.email')}
                    type="email" 
                    autoComplete="email"
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
                  {t('register.fields.password')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('register.placeholders.password')}
                    type="password" 
                    autoComplete="new-password"
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

          {/* Confirm password */}
          <FormField
            control={form.control}
            name="password_confirm"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-label font-normal text-base leading-6">
                  {t('register.fields.password_confirm')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('register.placeholders.password_confirm')}
                    type="password" 
                    autoComplete="new-password"
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

          {/* Global error message */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <Link 
              href="/login"
              className="text-base text-accent hover:text-accent/80 hover:underline transition-colors"
            >
              {t('register.login_link')}
            </Link>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-normal text-base rounded-lg bg-secondary/50 border border-secondary-border text-secondary-foreground hover:bg-secondary/70"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('register.submit')}
            </Button>
          </div>
          
        </form>
      </Form>
    </div>
  );
}