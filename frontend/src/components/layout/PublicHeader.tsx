'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { User } from '@/types/user';

interface PublicHeaderProps {
  isAuthenticated?: boolean;
  user?: User | null;
}

/**
 * Header for public pages (homepage, download, login, register)
 * Adapts content based on authentication status while keeping the imposed design.
 */
export default function PublicHeader({ isAuthenticated, user }: PublicHeaderProps) {
  const t = useTranslations('Common');

  // On réutilise exactement les mêmes classes que le bouton Login imposé
  const buttonClasses = "flex items-center justify-center px-4 h-10 bg-primary text-primary-foreground rounded-lg text-base font-normal transition-colors hover:bg-primary/90";

  // Helper pour les initiales (Identique au PrivateHeader)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // On utilise l'email comme nom d'affichage par défaut si pas de nom
  const displayName = user?.email || 'Utilisateur';

  return (
    <header className="w-full">
      <div className="ds-header">
        {/* DataShare Logo */}
        <Link href="/" className="font-display text-[32px] font-bold text-black leading-10">
          DataShare
        </Link>

        {/* Dynamic Auth Section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {/* User Profile (Avatar + Name) - Style inspiré du PrivateHeader */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
                {displayName}
              </span>
              {/* Avatar Cercle avec Initiales */}
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium shrink-0">
                {getInitials(displayName)}
              </div>
            </div>

            {/* Dashboard Action */}
            <Link 
              href="/dashboard"
              className={buttonClasses}
            >
              {/* Fallback sur "Mon espace" si la clé n'existe pas encore */}
              {t.has('buttons.dashboard') ? t('buttons.dashboard') : 'Mon espace'}
            </Link>
          </div>
        ) : (
          /* Login button (Original) */
          <Link 
            href="/login"
            className={buttonClasses}
          >
            {t('buttons.login')}
          </Link>
        )}
      </div>
    </header>
  );
}