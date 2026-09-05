import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  logo: z.string().url().or(z.literal('')).optional().default(''),
  description: z.string().max(500).optional().default(''),
  website: z.string().url().or(z.literal('')).optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateBrandSchema = createBrandSchema.partial();
