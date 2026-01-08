/**
 * i18n Configuration
 */

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeConfig: Record<Locale, { label: string; iso: string; dir: "ltr" | "rtl" }> = {
  fr: {
    label: "Français",
    iso: "fr_FR",
    dir: "ltr",
  },
  en: {
    label: "English",
    iso: "en_US",
    dir: "ltr",
  },
};