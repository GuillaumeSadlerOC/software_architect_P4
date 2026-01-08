'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { X, Files, Upload, LogOut } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export default function MobileDrawer({ isOpen, onClose, user, onLogout }: MobileDrawerProps) {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();

  // Prevent the body from scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Generate the initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    {
      href: '/dashboard',
      label: t('nav.my_files'),
      icon: Files,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 ds-bg-gradient opacity-95 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-primary text-primary-foreground animate-in slide-in-from-left duration-300 md:hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 h-16">
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('nav.close')}
          >
            <X className="w-6 h-6" />
          </button>

          <Link href="/" className="font-display text-xl font-bold text-white">
            DataShare
          </Link>

          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium">
              {getInitials(user.name)}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Logout button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('nav.logout')}</span>
          </button>

          {/* Copyright */}
          <p className="text-xs text-white/50 text-center">
            Copyright DataShare© 2025
          </p>
        </div>
      </div>
    </>
  );
}
