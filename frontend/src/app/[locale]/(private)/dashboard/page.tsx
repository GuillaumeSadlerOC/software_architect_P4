'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// API Hooks
import { useGetMyFilesQuery, useDeleteFileMutation } from '@/lib/store/features/files/filesApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectFileFilters } from '@/lib/store/features/files/filesSlice';

// UI Components
import FileList from '@/components/features/dashboard/FileList';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';

// Types
import { SharedFile } from '@/types/file';
import { FileData } from '@/components/features/dashboard/FileItem';

/**
 * File History Page
 * @see US05 - Viewing history
 * @see US06 - Deleting a file
 */
export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  
  // Retrieving filters from Redux
  const filters = useAppSelector(selectFileFilters);

  // Real API Call (RTK Query)
  // PollingInterval: refreshes every 30 seconds to view expirations
  const { 
    data: apiFiles, 
    isLoading, 
    isError, 
    refetch 
  } = useGetMyFilesQuery(filters, { pollingInterval: 30000 });

  // Mutation for deletion
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  
  // Local state for the modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; fileId: string | null }>({
    isOpen: false,
    fileId: null,
  });

  // Mapping Backend Data to UI
  const files: FileData[] = useMemo(() => {
    if (!apiFiles) return [];
    
    return apiFiles.map((f: SharedFile) => {
      const rawFile = f as any;
      const hasPassword = !!rawFile.password || !!f.hasPassword;

      return {
        id: f.id,
        name: f.filename,
        size: f.size,
        expiresAt: new Date(f.expirationDate),
        hasPassword: hasPassword,
        status: new Date(f.expirationDate) < new Date() ? 'expired' : 'active',
        shareToken: f.token,
        downloadCount: f.downloadCount,
        tags: f.tags || []
      };
    });
  }, [apiFiles]);

  // Actions
  const handleDeleteRequest = (id: string) => {
    setDeleteConfirm({ isOpen: true, fileId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.fileId) return;
    
    try {
      await deleteFile(deleteConfirm.fileId).unwrap();
      
      toast.success(t('toast.file_deleted'));
      setDeleteConfirm({ isOpen: false, fileId: null });
    } catch (err) {
      console.error(err);
      toast.error(t('toast.delete_failed'));
    }
  };

  const handleCopyLink = async (token: string) => {
    const link = `${window.location.origin}/download/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('toast.link_copied'));
    } catch (err) {
      toast.error(t('toast.copy_failed'));
    }
  };

  // Rendering: Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Rendered: Error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive font-medium">{t('errors.load_failed')}</p>
        <Button onClick={() => refetch()} variant="outline">
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <div className="text-sm text-muted-foreground">
          {files.length} {files.length > 1 ? t('files_count_plural') : t('files_count_singular')}
        </div>
      </div>

      {/* List of files */}
      <FileList
        files={files}
        onDelete={handleDeleteRequest}
        onCopyLink={handleCopyLink}
      />

      {/* Deletion confirmation method (US06) */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, fileId: null })}
        onConfirm={handleDeleteConfirm}
        title={t('delete_confirm.title')}
        message={t('delete_confirm.message')}
        confirmLabel={t('delete_confirm.confirm')}
        cancelLabel={t('delete_confirm.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}