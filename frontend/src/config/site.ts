/**
 * Overall site configuration
 */

import { env } from "@/config/env";

export const siteConfig = {
  name: 'DataShare',
  description: "Application de gestion de fichiers.",
  url: env.NEXT_PUBLIC_APP_URL, 
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/images/seo/og-default.jpg`,
  themeColor: '#1a1a1a',

  // Boundaries
  maxFileSize: 1024 * 1024 * 1024, // 1 GB
  maxExpirationDays: 7,

};

export type SiteConfig = typeof siteConfig;
