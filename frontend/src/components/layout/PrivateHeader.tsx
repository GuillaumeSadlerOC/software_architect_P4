'use client';

import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';

interface PrivateHeaderProps {
  user: {
    name: string;
    avatar?: string;
  };
  onMenuClick: () => void;
}

/**
 * Mobile header for the private area
 * Displays the burger menu and user avatar
 */
export default function PrivateHeader({ user, onMenuClick }: PrivateHeaderProps) {
  const t = useTranslations('Common');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="w-full bg-card border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Burger menu */}
        <button
          onClick={onMenuClick}
          className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          aria-label={t('menu.open')}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground font-medium">
            {user.name}
          </span>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">
              {getInitials(user.name)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
