import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const variantSchema = z.object({
  sku: z.string().max(50).trim().optional().or(z.literal('')),
  color: z.object({
    name: z.string().min(1),
    hexCode: z.string().min(2),
  }),
  size: z.string().min(1),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  image: z.string().optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200).trim(),
  slug: z.string().max(200).optional().nullable().or(z.literal('')),
  sku: z.string().max(50).optional().nullable().or(z.literal('')),
  description: z.string().optional().default(''),
  shortDescription: z.string().max(300).optional().default(''),
  categoryId: z.string().regex(objectIdRegex, 'Valid Category ID is required'),
  subcategoryId: z.string().regex(objectIdRegex, 'Invalid Subcategory ID').nullable().optional().or(z.literal('')),
  brandId: z.string().regex(objectIdRegex, 'Invalid Brand ID').nullable().optional().or(z.literal('')),
  images: z.array(z.string().min(1)).optional().default([]),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).nullable().optional(),
  tax: z.number().min(0).max(100).optional().default(0),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(150).optional().default(''),
  seoDescription: z.string().max(300).optional().default(''),
  variants: z.array(variantSchema).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().transform((val) => Math.max(1, parseInt(val, 10) || 1)).optional().default('1'),
  limit: z.string().transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 10))).optional().default('10'),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  isFeatured: z.string().transform((v) => v === 'true').optional(),
  inStock: z.string().transform((v) => v === 'true').optional(),
  sortBy: z.enum(['price', 'createdAt', 'name', 'totalStock']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
