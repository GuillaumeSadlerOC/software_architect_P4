'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

/**
 * Confirmation modal
 * 
 * Used for:
 * - US06: File deletion confirmation
 * - Other destructive actions
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslations('Common');

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-destructive',
      iconBg: 'bg-destructive/10',
      button: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    warning: {
      icon: 'text-warning',
      iconBg: 'bg-warning/10',
      button: 'bg-warning text-warning-foreground hover:bg-warning/90',
    },
    default: {
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
      button: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-4 animate-in fade-in zoom-in-95">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="font-display text-xl font-bold text-center text-card-foreground"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="confirm-dialog-message"
            className="text-center text-muted-foreground"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-10 rounded-lg"
            >
              {cancelLabel || t('buttons.cancel')}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-10 rounded-lg ${styles.button}`}
            >
              {isLoading ? t('buttons.loading') : confirmLabel || t('buttons.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
