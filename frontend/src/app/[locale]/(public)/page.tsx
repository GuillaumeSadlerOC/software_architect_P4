'use client';

import { useState } from 'react';
import UploadHero from '@/components/features/upload/UploadHero';
import UploadSheet from '@/components/features/upload/UploadSheet';

/**
 * Homepage - File Upload
 * 
 * @see US01 - Upload with account
 * @see US07 - Anonymous upload
 */
export default function HomePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* Centered upload zone */}
      <div className="flex-1 flex items-center justify-center">
        <UploadHero onUploadClick={() => setIsSheetOpen(true)} />
      </div>

      {/* Modal/Upload Sheet */}
      <UploadSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
    </>
  );
}
