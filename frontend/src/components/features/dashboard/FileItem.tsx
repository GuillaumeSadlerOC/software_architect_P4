'use client';

import { useTranslations } from 'next-intl';
import { FileImage, Lock, Trash2, Link as LinkIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TagList from './TagList';

export interface FileData {
  id: string;
  name: string;
  size: number;
  expiresAt: Date;
  hasPassword: boolean;
  status: 'active' | 'expired';
  shareToken: string;
  tags?: string[];
}

interface FileItemProps {
  file: FileData;
  onDelete: (id: string) => void;
  onCopyLink: (token: string) => void;
  onEditTags: () => void;
}

export default function FileItem({ file, onDelete, onCopyLink, onEditTags }: FileItemProps) {
  const t = useTranslations('Dashboard');

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
  const getExpirationText = (): { text: string; isUrgent: boolean } => {
    if (file.status === 'expired') {
      return { text: t('file.expired'), isUrgent: true };
    }

    const now = new Date();
    const diffMs = file.expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return { text: t('file.expires_tomorrow'), isUrgent: true };
    }

    return { 
      text: t('file.expires_in_days', { days: diffDays }), 
      isUrgent: false 
    };
  };

  const expiration = getExpirationText();
  const isExpired = file.status === 'expired';

  return (
    <div className={`flex items-center gap-4 p-4 bg-card rounded-lg border border-border ${isExpired ? 'opacity-60' : ''}`}>
      {/* File icon */}
      <div className="relative">
        <FileImage className="w-8 h-8 text-foreground shrink-0" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-base text-foreground truncate font-medium">
            {file.name}
          </p>
          {/* Padlock if password */}
          {file.hasPassword && (
            <Lock 
              className="w-3.5 h-3.5 text-orange-500 shrink-0" 
              aria-label="Protégé par mot de passe"
              title="Protégé par mot de passe"
            />
          )}
        </div>
        
        {/* Displaying tags (US08) */}
        {file.tags && file.tags.length > 0 && (
          <TagList tags={file.tags} className="my-0.5" />
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
          <span className="text-muted-foreground">•</span>
          <span className={`text-sm ${expiration.isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {expiration.text}
          </span>
        </div>
      </div>

      {/* Actions */}
      {isExpired ? (
        <div className="flex items-center gap-2">
           <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(file.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title={t('actions.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <p className="text-sm text-muted-foreground italic hidden md:block">
            {t('file.expired_message')}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(file.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title={t('actions.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Edit Tags button (US08) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEditTags}
            className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg"
            title={t('tags.edit_tooltip')}
          >
            <Tag className="w-4 h-4" />
          </Button>

          {/* Access/Copy link button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCopyLink(file.shareToken)}
            className="h-8 px-3 border-secondary-border text-secondary-foreground bg-secondary/50 hover:bg-secondary/70 rounded-lg ml-2"
          >
            <LinkIcon className="w-3.5 h-3.5 md:mr-2" />
            <span className="hidden md:inline">{t('actions.access')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}