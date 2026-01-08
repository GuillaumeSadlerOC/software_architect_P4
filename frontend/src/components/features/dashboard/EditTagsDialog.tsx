'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TagInput from './TagInput';

import { useUpdateFileTagsMutation } from '@/lib/store/features/files/filesApi';
import { useGetMyTagsQuery } from '@/lib/store/features/tags/tagsApi';

interface EditTagsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  initialTags: string[];
}

export default function EditTagsDialog({
  isOpen,
  onClose,
  fileId,
  initialTags,
}: EditTagsDialogProps) {
  const t = useTranslations('Dashboard');
  const [tags, setTags] = useState<string[]>(initialTags);
  
  // API Mutations & Queries
  const [updateTags, { isLoading }] = useUpdateFileTagsMutation();
  const { data: existingTags } = useGetMyTagsQuery();

  const handleSave = async () => {
    try {
      await updateTags({ id: fileId, tags }).unwrap();
      toast.success(t('tags.update_success'));
      onClose();
    } catch (error) {
      toast.error(t('tags.update_error'));
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('tags.edit_title')}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={existingTags?.map(t => t.label)}
            placeholder={t('tags.placeholder')}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#E77A6E] hover:bg-[#d66a5e] text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}