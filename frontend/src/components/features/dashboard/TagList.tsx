import { Tag } from 'lucide-react';

interface TagListProps {
  tags: string[] | null;
  className?: string;
}

export default function TagList({ tags, className = '' }: TagListProps) {
  // Security: If there are no tags or the table is empty, nothing is displayed
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
        >
          <Tag className="w-3 h-3 mr-1 opacity-50" />
          {tag}
        </span>
      ))}
    </div>
  );
}