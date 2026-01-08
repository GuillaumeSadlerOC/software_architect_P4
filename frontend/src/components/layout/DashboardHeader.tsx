'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onAddFile: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({ onAddFile, onLogout }: DashboardHeaderProps) {
  const t = useTranslations('Dashboard');

  return (
    <header className="hidden md:flex items-center justify-between px-6 h-[72px] bg-muted/30 border-b border-border">
      <div />

      {/* Actions on the right */}
      <div className="flex items-center gap-4">
        {/* Add Files Button */}
        <Button
          type="button"
          onClick={onAddFile}
          className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('actions.add_files')}
        </Button>

        {/* Logout button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onLogout}
          className="h-10 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.logout')}
        </Button>
      </div>
    </header>
  );
}