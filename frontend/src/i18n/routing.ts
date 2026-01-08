import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '@/config/i18n';

export const routing = defineRouting({
  // 1. Supported languages
  locales: locales,

  // 2. Default language if detection fails
  defaultLocale: defaultLocale,

  // 3. URL MAPPING
  pathnames: {

    // =============================================
    // (PUBLIC)
    // =============================================
    
    // Landing Page (UPLOAD)
    '/': {
      en: '/',
      fr: '/'
    },

    '/server-error': {
      en: '/server-error',
      fr: '/erreur-serveur'
    },

    // --- (AUTH) ---
    
    '/login': {
      en: '/login',
      fr: '/connexion'
    },
    
    '/register': {
      en: '/register',
      fr: '/inscription'
    },
    
    '/logout': {
      en: '/logout',
      fr: '/deconnexion'
    },

    // --- DOWNLOAD ---
    '/download/[token]': {
      en: '/download/[token]',
      fr: '/telechargement/[token]'
    },

    // =============================================
    // (PRIVATE)
    // =============================================

    // Dashboard Home
    '/dashboard': {
      en: '/dashboard',
      fr: '/tableau-de-bord'
    },

  }
});

// Wrappers types-safe
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);