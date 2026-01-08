import { z } from 'zod';
import { MIN_FILE_PASSWORD_LENGTH } from '@/config/upload';

/**
 * Validation scheme for the download form (password entry)
 * @see US02
 */
export const downloadSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'token_required' })
    .uuid({ message: 'token_invalid' }),

  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= MIN_FILE_PASSWORD_LENGTH,
      { message: 'password_too_short' }
    ),
});

export type DownloadFormData = z.infer<typeof downloadSchema>;

/**
 * Scheme for validating public metadata received from the backend
 * @see US02 - Metadata visible before download
 */
export const fileMetadataSchema = z.object({
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  expiresAt: z.string().datetime(),
  hasPassword: z.boolean(),
  isExpired: z.boolean(),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

/**
 * Possible errors during download (for UX display)
 */
export type DownloadError =
  | 'file_not_found'
  | 'file_expired'
  | 'invalid_password'
  | 'download_failed'
  | 'unauthorized';