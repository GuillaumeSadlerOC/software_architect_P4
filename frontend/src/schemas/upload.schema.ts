import { z } from 'zod';
import {
  MAX_FILE_SIZE,
  MIN_FILE_PASSWORD_LENGTH,
  MAX_EXPIRATION_DAYS,
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_FILE,
  FORBIDDEN_EXTENSIONS,
} from '@/config/upload';

/**
 * Validation scheme for file upload (UI form)
 * @see US01
 */
export const uploadSchema = z.object({
  // Optional password
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= MIN_FILE_PASSWORD_LENGTH,
      { message: 'password_too_short' }
    ),

  // Expiration: 1 to 7 days
  expirationDays: z
    .number()
    .int()
    .min(1, { message: 'expiration_min' })
    .max(MAX_EXPIRATION_DAYS, { message: 'expiration_max' })
    .default(7),

  // Optional tags (US08)
  tags: z
    .array(
      z.string()
        .max(MAX_TAG_LENGTH, { message: 'tag_too_long' })
        .regex(/^[a-zA-Z0-9À-ÿ\s-_]+$/, { message: 'tag_invalid_chars' })
    )
    .max(MAX_TAGS_PER_FILE, { message: 'too_many_tags' })
    .optional()
    .default([]),
});

export type UploadFormData = z.infer<typeof uploadSchema>;

/**
 * Client-side validation of the FILE ITSELF (size, extension)
 * Used in the Dropzone
 */
export const fileValidationSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(MAX_FILE_SIZE, { message: 'file_too_large' }),
  type: z.string().optional(),
}).refine(
  (file) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return !FORBIDDEN_EXTENSIONS.includes(extension);
  },
  { message: 'forbidden_extension' }
);