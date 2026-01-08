'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FileUploadForm from './FileUploadForm';

interface UploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal/Sheet responsive for upload
 * - Mobile : Bottom sheet
 * - Desktop : Modal centered
 * 
 * @see US01 - Upload with account
 * @see US07 - Anonymous upload
 */
export default function UploadSheet({ isOpen, onClose }: UploadSheetProps) {
  const t = useTranslations('Common');

  // Prevent the body from scrolling when the sheet is open
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container */}
      <div 
        className="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Card */}
        <div 
          className="relative bg-card shadow-card max-h-[90vh] overflow-y-auto rounded-t-2xl w-full animate-in slide-in-from-bottom duration-300 md:rounded-2xl md:w-full md:max-w-[420px] md:animate-in md:fade-in md:zoom-in-95 md:slide-in-from-bottom-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar - Mobile */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>

          {/* Close button - Desktop */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            aria-label={t('buttons.close')}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Form */}
          <div className="px-6 pb-6 pt-2 md:pt-6">
            <FileUploadForm onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
