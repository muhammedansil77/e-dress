import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  image: z.string().optional().default(''),
  parentId: z.string().regex(objectIdRegex, 'Invalid parent category ID').nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  displayOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(150).optional().default(''),
  seoDescription: z.string().max(300).optional().default(''),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().optional(),
  parentId: z.string().regex(objectIdRegex).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  displayOrder: z.number().int().min(0).optional(),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
});

export const updateCategoryStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const categoryQuerySchema = z.object({
  page: z.string().transform((val) => Math.max(1, parseInt(val, 10) || 1)).optional().default('1'),
  limit: z.string().transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 10))).optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  parentId: z.string().optional(),
  sortBy: z.enum(['name', 'displayOrder', 'createdAt', 'updatedAt']).optional().default('displayOrder'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const categoryIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid category ID format'),
});
