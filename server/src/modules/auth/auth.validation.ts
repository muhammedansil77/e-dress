import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token is required').optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
