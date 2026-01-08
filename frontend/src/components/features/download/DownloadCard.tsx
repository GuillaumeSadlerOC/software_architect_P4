'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileImage, Download, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Types for the different file states
type FileStatus = 'password_required' | 'ready' | 'expiring_soon' | 'expired';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  expiresAt: Date;
  hasPassword: boolean;
  status: FileStatus;
}

interface DownloadCardProps {
  file: FileInfo;
  onDownload: (password?: string) => Promise<void>;
}

export default function DownloadCard({ file, onDownload }: DownloadCardProps) {
  const t = useTranslations('Download');
  
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format the file size
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }
    return `${bytes} octets`;
  };

  // Calculate the expiration message
  const getExpirationMessage = (): { message: string; variant: 'info' | 'warning' | 'error' } => {
    if (file.status === 'expired') {
      return {
        message: t('status.expired'),
        variant: 'error',
      };
    }

    const now = new Date();
    const diffMs = file.expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return {
        message: t('status.expires_tomorrow'),
        variant: 'warning',
      };
    }

    return {
      message: t('status.expires_in_days', { days: diffDays }),
      variant: 'info',
    };
  };

  // Manage download
  const handleDownload = async () => {
    if (file.status === 'expired') return;
    if (file.hasPassword && !password) return;

    setIsLoading(true);
    setError('');

    try {
      await onDownload(file.hasPassword ? password : undefined);
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      if (error.status === 401) {
        setError(t('errors.invalid_password'));
      } else {
        setError(t('errors.download_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const expiration = getExpirationMessage();
  const isExpired = file.status === 'expired';
  const canDownload = !isExpired && (!file.hasPassword || password.length > 0);

  // Styles for expiration badges
  const badgeStyles = {
    info: 'bg-accent/10 border-accent/30 text-accent',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  const iconByVariant = {
    info: Clock,
    warning: AlertTriangle,
    error: XCircle,
  };

  const ExpirationIcon = iconByVariant[expiration.variant];

  return (
    <div className="w-full bg-card shadow-card rounded-2xl p-6 space-y-6">
      {/* Title */}
      <h2 className="font-display text-[28px] font-bold text-center text-card-foreground leading-10">
        {t('title')}
      </h2>

      {/* File info */}
      <div className="flex items-center gap-4 p-2">
        <FileImage className="w-6 h-6 text-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base text-foreground truncate">
            {file.name}
          </p>
          <p className="text-sm text-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      {/* Expiration badge */}
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${badgeStyles[expiration.variant]}`}>
        <ExpirationIcon className="w-4 h-4 shrink-0" />
        <span className="text-sm">
          {expiration.message}
        </span>
      </div>

      {/* Password field (if required and file not expired) */}
      {file.hasPassword && !isExpired && (
        <div className="space-y-2">
          <Label htmlFor="download-password" className="text-label font-normal text-base">
            {t('password_label')}
          </Label>
          <Input
            id="download-password"
            type="password"
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            disabled={isLoading}
            className={`h-10 bg-input border-border rounded-lg px-4 text-foreground placeholder:text-muted-foreground ${
              error ? 'border-destructive focus:ring-destructive' : ''
            }`}
          />
          {/* Error message: Invalid password */}
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Download button */}
      {!isExpired && (
        <Button
          type="button"
          onClick={handleDownload}
          disabled={!canDownload || isLoading}
          className={`w-full h-10 rounded-lg text-base font-normal transition-colors ${
            !canDownload
              ? 'bg-muted/50 border border-muted text-muted-foreground cursor-not-allowed'
              : 'bg-secondary/50 border border-secondary-border text-secondary-foreground hover:bg-secondary/70'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          {isLoading ? t('downloading') : t('download_button')}
        </Button>
      )}
    </div>
  );
}
