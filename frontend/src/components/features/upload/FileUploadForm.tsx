'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FileImage, Upload, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Config & UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MAX_FILE_SIZE,
  FORBIDDEN_EXTENSIONS,
  MIN_FILE_PASSWORD_LENGTH,
  DEFAULT_EXPIRATION_DAYS,
  isFileAllowed,
  formatFileSize,
} from '@/config/upload';

// Redux & API
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/features/auth/authSlice';
import { 
  useUploadFileMutation, 
  useUploadFileAnonymousMutation 
} from '@/lib/store/features/files/filesApi';

const EXPIRATION_VALUES = ['1', '2', '3', '7'] as const;

type UploadState = 'idle' | 'selected' | 'error' | 'success';

interface FileUploadFormProps {
  onClose?: () => void;
  isAuthenticated?: boolean;
}

export default function FileUploadForm({ onClose, isAuthenticated: propIsAuth }: FileUploadFormProps) {
  const t = useTranslations('Upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Login to the Redux Store
  const storeIsAuth = useAppSelector(selectIsAuthenticated);
  const isAuth = propIsAuth ?? storeIsAuth;

  // Hooks API (Auth vs Anonymous)
  const [uploadFile, { isLoading: isAuthLoading }] = useUploadFileMutation();
  const [uploadAnon, { isLoading: isAnonLoading }] = useUploadFileAnonymousMutation();
  
  const isLoading = isAuthLoading || isAnonLoading;

  // Local States
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [expiration, setExpiration] = useState(String(DEFAULT_EXPIRATION_DAYS));
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const expirationOptions = EXPIRATION_VALUES.map((value) => ({
    value,
    label: t(`expiration_options.${value}`),
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setShareLink('');
    setCopied(false);
    setPasswordError('');

    const validation = isFileAllowed(file);
    if (!validation.allowed) {
      setUploadState('error');
      setErrorMessage(t(`errors.${validation.reason}`));
    } else {
      setUploadState('selected');
      setErrorMessage('');
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const validatePassword = (): boolean => {
    if (password && password.length < MIN_FILE_PASSWORD_LENGTH) {
      setPasswordError(t('validation.password_too_short'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  // --- UPLOAD HEARTH ---
  const handleUpload = async () => {
    if (!selectedFile || uploadState === 'error') return;
    if (!validatePassword()) return;

    setErrorMessage('');

    // FormData Construction (Standard Multipart)
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('expirationDays', expiration);
    
    if (password) {
      formData.append('password', password);
    }

    try {
      let response;
      
      // Conditional Auth/Anonymous Call
      if (isAuth) {
        response = await uploadFile(formData).unwrap();
      } else {
        response = await uploadAnon(formData).unwrap();
      }

      const link = `${window.location.origin}/download/${response.token}`;
      
      setShareLink(link);
      setUploadState('success');
      toast.success(t('success.message'));

    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadState('error');
      
      // Handling common errors
      if (err.status === 413) {
        setErrorMessage(t('errors.file_too_large'));
      } else if (err.status === 415) {
        setErrorMessage(t('errors.forbidden_extension'));
      } else {
        setErrorMessage(t('errors.upload_failed'));
      }
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success(t('form.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setShareLink('');
    setPassword('');
    setPasswordError('');
    setExpiration(String(DEFAULT_EXPIRATION_DAYS));
    setErrorMessage('');
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      <h2 className="font-display text-[28px] font-bold text-center text-card-foreground leading-10">
        {t('form.title')}
      </h2>

      {/* Selected file area */}
      {selectedFile ? (
        <div className="space-y-2">
          <div className={`flex items-center gap-4 p-3 border rounded-lg ${uploadState === 'error' ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'}`}>
            <FileImage className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className={`text-xs ${uploadState === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {uploadState !== 'success' && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openFileSelector}
                className="shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                {t('form.change')}
              </Button>
            )}
          </div>
          {uploadState === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-sm text-destructive px-1">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={openFileSelector}
          className="w-full p-8 border-2 border-dashed border-muted-foreground/25 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
            <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-base font-medium">{t('form.select_file')}</span>
            <span className="text-xs text-muted-foreground/70">
              Max {formatFileSize(MAX_FILE_SIZE)}
            </span>
          </div>
        </button>
      )}

      {/* Success - Link generated */}
      {uploadState === 'success' && shareLink && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
            <Check className="w-5 h-5" />
            <p className="text-sm font-medium">{t('success.message')}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('form.share_link_label')}
            </Label>
            <div className="flex gap-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="font-mono text-sm bg-muted/50"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Options (visible if file is selected and not yet uploaded) */}
      {selectedFile && uploadState !== 'success' && (
        <div className="space-y-4 pt-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4">
            {/* Expiration */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="expiration" className="text-xs uppercase text-muted-foreground">
                {t('form.expiration')}
              </Label>
              <select
                id="expiration"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                disabled={isLoading}
                className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-ring"
              >
                {expirationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="password" className="text-xs uppercase text-muted-foreground">
                {t('form.password')} <span className="text-muted-foreground/50 lowercase">({t('form.optional')})</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                disabled={isLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </div>
          </div>
          
          {passwordError && (
            <p className="text-xs text-destructive mt-1">{passwordError}</p>
          )}
        </div>
      )}

      {/* Warning: anonymous upload */}
      {!isAuth && uploadState !== 'success' && selectedFile && (
        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {t('anonymous.notice')}
          </p>
        </div>
      )}

      {/* Action button */}
      <Button
        type="button"
        onClick={uploadState === 'success' ? handleNewUpload : handleUpload}
        disabled={!selectedFile || uploadState === 'error' || isLoading}
        className={`w-full h-11 text-base font-medium shadow-sm transition-all ${
          uploadState === 'success' ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : ''
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('form.uploading')}
          </>
        ) : uploadState === 'success' ? (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {t('form.new_upload')}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {t('form.submit')}
          </>
        )}
      </Button>
    </div>
  );
}