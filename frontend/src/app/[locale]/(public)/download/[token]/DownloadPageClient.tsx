'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useDownloadFileMutation } from '@/lib/store/features/files/filesApi';
import DownloadCard from '@/components/features/download/DownloadCard';

type FileStatus = 'password_required' | 'ready' | 'expiring_soon' | 'expired';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  expiresAt: Date;
  hasPassword: boolean;
  status: FileStatus;
  token: string;
}

interface DownloadPageClientProps {
  file: FileInfo;
}

export default function DownloadPageClient({ file }: DownloadPageClientProps) {
  const t = useTranslations('Download');
  
  // Using RTK Query Mutation
  const [downloadFile, { isLoading }] = useDownloadFileMutation();
  
  const handleDownload = async (password?: string) => {
    try {
      // API call
      const blob = await downloadFile({ 
        token: file.token, 
        password 
      }).unwrap();
      
      // Creating an invisible download link (Blob URL)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // We force the file name (important for UX)
      link.setAttribute('download', file.name);
      
      // Click simulation and cleaning
      document.body.appendChild(link);
      link.click();
      
      // Immediate cleanup to free up browser memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(t('toast.download_started'));

    } catch (err: any) {
      console.error('Download error:', err);

      // Handling specific errors
      if (err.status === 403 || err.status === 401) {
        toast.error(t('errors.invalid_password'));
        throw new Error('INVALID_PASSWORD');
      } else if (err.status === 410 || err.status === 404) {
        toast.error(t('errors.file_expired_or_not_found'));
      } else {
        toast.error(t('errors.download_failed'));
      }
    }
  };

  return (
    <DownloadCard 
      file={file} 
      onDownload={handleDownload}
      isLoading={isLoading}
    />
  );
}