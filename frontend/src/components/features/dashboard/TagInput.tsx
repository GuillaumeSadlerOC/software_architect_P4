'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X, Plus } from 'lucide-react';
import { MAX_TAG_LENGTH, MAX_TAGS_PER_FILE } from '@/config/upload';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Input component for tags tags
 * @see US08
 */
export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  disabled = false,
  placeholder,
}: TagInputProps) {
  const t = useTranslations('Dashboard');
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Add a tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    // Validations
    if (!trimmedTag) return;
    if (trimmedTag.length > MAX_TAG_LENGTH) return;
    if (tags.includes(trimmedTag)) return;
    if (tags.length >= MAX_TAGS_PER_FILE) return;

    onChange([...tags, trimmedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  // Delete a tag
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  // Manage keyboard keys
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
      inputRef.current?.focus();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const canAddMore = tags.length < MAX_TAGS_PER_FILE;

  return (
    <div className="space-y-2">
      {/* Existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-orange-100 text-orange-800 border border-orange-200"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-0.5 hover:bg-orange-200 rounded-full transition-colors"
                  aria-label={t('tags.remove', { tag })}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input to add a tag */}
      {canAddMore && !disabled && (
        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={handleBlur}
              placeholder={placeholder || t('tags.placeholder')}
              maxLength={MAX_TAG_LENGTH}
              className="flex-1 h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            />
            <button
              type="button"
              onClick={() => {
                addTag(inputValue);
                inputRef.current?.focus();
              }}
              disabled={!inputValue.trim()}
              className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('tags.add')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addTag(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Message if limit reached */}
      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          {t('tags.max_reached', { max: MAX_TAGS_PER_FILE })}
        </p>
      )}
    </div>
  );
}