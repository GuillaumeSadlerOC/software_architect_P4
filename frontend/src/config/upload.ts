/**
 * File upload configuration
 * 
 * Based on DataShare functional specifications
 * @see US01
 */

// Maximum size: 1 GB
export const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB in bytes
export const MAX_FILE_SIZE_MB = 1024; // For display

// Prohibited file types (security)
export const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.scr',
  '.pif',
  '.vbs',
  '.vbe',
  '.js',
  '.jse',
  '.ws',
  '.wsf',
  '.wsc',
  '.wsh',
  '.ps1',
  '.ps1xml',
  '.ps2',
  '.ps2xml',
  '.psc1',
  '.psc2',
  '.reg',
  '.inf',
  '.scf',
  '.lnk',
  '.dll',
  '.sys',
];

// Dangerous MIME types
export const FORBIDDEN_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-ms-dos-executable',
  'application/x-executable',
  'application/x-dosexec',
  'application/bat',
  'application/x-bat',
  'application/x-msi',
  'application/x-ms-shortcut',
];

// Available expiration dates (in days)
export const EXPIRATION_OPTIONS = [
  { value: 1, labelKey: 'expiration_options.1' },
  { value: 2, labelKey: 'expiration_options.2' },
  { value: 3, labelKey: 'expiration_options.3' },
  { value: 7, labelKey: 'expiration_options.7' },
] as const;

// Default expiration: 7 days
export const DEFAULT_EXPIRATION_DAYS = 7;

// Maximum expiration date: 7 days
export const MAX_EXPIRATION_DAYS = 7;

// Minimum file password length
export const MIN_FILE_PASSWORD_LENGTH = 6;

// Maximum tag length
export const MAX_TAG_LENGTH = 30;

// Maximum number of tags per file
export const MAX_TAGS_PER_FILE = 10;

/**
 * Check if a file is allowed
 */
export function isFileAllowed(file: File): { allowed: boolean; reason?: string } {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return {
      allowed: false,
      reason: 'file_too_large',
    };
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (FORBIDDEN_EXTENSIONS.includes(extension)) {
    return {
      allowed: false,
      reason: 'forbidden_extension',
    };
  }

  // Check the MIME type
  if (FORBIDDEN_MIME_TYPES.includes(file.type)) {
    return {
      allowed: false,
      reason: 'forbidden_type',
    };
  }

  return { allowed: true };
}

/**
 * Formats the file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }
  return `${bytes} octets`;
}
