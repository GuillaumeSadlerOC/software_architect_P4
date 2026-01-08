'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { FileFilter } from '@/types/file';
import { 
  selectFileFilters, 
  setFilters, 
  resetFilters 
} from '@/lib/store/features/files/filesSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useGetMyTagsQuery } from '@/lib/store/features/tags/tagsApi';

/**
 * File filters + Filter by tag
 * @see US05 - Viewing history
 * @see US08 - Filtering by tags
 */
export default function FileFilters() {
  const t = useTranslations('Dashboard');
  const dispatch = useAppDispatch();
  
  // Redux Store Login (Source of Truth)
  const filters = useAppSelector(selectFileFilters);
  const currentStatus = (filters.search === 'expired' ? 'expired' : 'active') as 'active' | 'expired' | 'all'; 

  // Retrieving available tags (API)
  const { data: availableTags } = useGetMyTagsQuery();

  const handleStatusChange = (status: 'active' | 'expired' | 'all') => {
    console.log("Status changed to", status); 
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ tag: e.target.value || undefined }));
  };

  const clearTag = () => {
    dispatch(setFilters({ tag: undefined }));
  };

  const figmaContainerStyle = {
    background: 'rgba(255, 193, 145, 0.16)',
    border: '1px solid rgba(215, 99, 11, 0.2)',
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div 
        className="relative inline-flex items-center rounded-lg h-10 px-3"
        style={figmaContainerStyle}
      >
        <select
          value={filters.tag || ''}
          onChange={handleTagChange}
          className="bg-transparent border-none text-sm text-foreground focus:ring-0 cursor-pointer pr-8 outline-none appearance-none min-w-[120px]"
        >
          <option value="">{t('filters.all_tags')}</option>
          {availableTags?.map((tag) => (
            <option key={tag.label} value={tag.label}>
              {tag.label} ({tag.count})
            </option>
          ))}
        </select>
        
        {/* Cross to clear */}
        {filters.tag && (
          <button
            onClick={clearTag}
            className="absolute right-2 text-orange-700 hover:text-orange-900"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}