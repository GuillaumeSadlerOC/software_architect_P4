'use client';

import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadHeroProps {
  onUploadClick: () => void;
}

/**
 * Hook area with upload button
 * 
 * @see US01 - Upload with account
 * @see US07 - Anonymous upload
 */
export default function UploadHero({ onUploadClick }: UploadHeroProps) {
  const t = useTranslations('Upload');

  return (
    <div className="flex flex-col items-center gap-6 px-6">
      {/* Catchy text */}
      <h2 className="ds-text-hero text-black">
        {t('hero.title')}
      </h2>

      {/* Decorative circles with upload icon */}
      <button
        onClick={onUploadClick}
        className="group relative flex items-center justify-center"
        aria-label={t('hero.upload_button')}
      >
        {/* Outer circle */}
        <div className="flex items-center justify-center w-36 h-36 rounded-full bg-decorative-outer transition-transform group-hover:scale-105 group-active:scale-95">
          {/* Inner circle */}
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-decorative-inner transition-transform group-hover:scale-105">
            {/* Upload icon */}
            <Upload 
              className="w-12 h-12 text-decorative-icon" 
              strokeWidth={1.5}
            />
          </div>
        </div>
      </button>
    </div>
  );
}
