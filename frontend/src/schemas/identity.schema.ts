import { z } from 'zod';

/**
 * Scheme for login
 * @see US04
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'email_required' })
    .email({ message: 'email_invalid' }),
  password: z
    .string()
    .min(1, { message: 'password_required' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

/**
 * Scheme for registration (Register)
 * @see US03
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'email_required' })
      .email({ message: 'email_invalid' }),
    password: z
      .string()
      .min(8, { message: 'password_min_length' }) // Min 8 chars
      .regex(/[0-9]/, { message: 'password_digit_required' })
      .regex(/[a-z]/, { message: 'password_lowercase_required' })
      .regex(/[A-Z]/, { message: 'password_uppercase_required' }),
    password_confirm: z
      .string()
      .min(1, { message: 'password_confirm_required' }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'passwords_dont_match',
    path: ['password_confirm'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;