'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Files } from 'lucide-react';

export default function DashboardSidebar() {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: t('nav.my_files'),
      icon: Files,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 ds-bg-gradient text-primary-foreground">
      {/* Logo */}
      <div className="p-4 h-[72px] flex items-center">
        <Link href="/" className="font-display text-2xl font-bold text-white">
          DataShare
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      {/* Footer sidebar */}
      <div className="p-4">
        <p className="text-xs text-white/50">
          Copyright DataShare© 2025
        </p>
      </div>
    </aside>
  );
}


