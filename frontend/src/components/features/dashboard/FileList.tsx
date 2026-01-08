'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import FileFilters from './FileFilters';
import FileItem, { FileData } from './FileItem';
import EditTagsDialog from './EditTagsDialog';

interface FileListProps {
  files: FileData[];
  onDelete: (id: string) => void;
  onCopyLink: (token: string) => void;
}

export default function FileList({ files, onDelete, onCopyLink }: FileListProps) {
  const t = useTranslations('Dashboard');
  
  const [editingFile, setEditingFile] = useState<{ id: string; tags: string[] } | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FileFilters />
      </div>

      {/* List of files */}
      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={onDelete}
              onCopyLink={onCopyLink}
              onEditTags={() => setEditingFile({ id: file.id, tags: file.tags || [] })}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground">
            {t('empty.no_files')}
          </div>
        </div>
      )}

      {/* Editing mode */}
      {editingFile && (
        <EditTagsDialog
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          fileId={editingFile.id}
          initialTags={editingFile.tags}
        />
      )}
    </div>
  );
}