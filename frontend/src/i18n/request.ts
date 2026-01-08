import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validation of the local
  let locale = await requestLocale;
  // @ts-ignore
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Modular loading
  // Each "Namespace" is loaded individually.
  // This helps keep files small and organized.
  return {
    locale,
    messages: {
      Account: (await import(`./locales/${locale}/account.json`)).default,
      Auth: (await import(`./locales/${locale}/auth.json`)).default,
      Common: (await import(`./locales/${locale}/common.json`)).default,
      Dashboard: (await import(`./locales/${locale}/dashboard.json`)).default,
      Download: (await import(`./locales/${locale}/download.json`)).default,
      Error: (await import(`./locales/${locale}/error.json`)).default,
      Security: (await import(`./locales/${locale}/security.json`)).default,
      GlobalSeo: (await import(`./locales/${locale}/seo.json`)).default,
      Upload: (await import(`./locales/${locale}/upload.json`)).default,
    }
  };
});