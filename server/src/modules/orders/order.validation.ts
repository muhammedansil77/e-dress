import { z } from 'zod';

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(6, 'Valid phone number is required'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('India'),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantSku: z.string().min(1, 'Variant SKU is required'),
  quantity: z.number().int().positive().min(1).default(1),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required'),
  customerPhone: z.string().min(6, 'Valid contact phone is required'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['COD', 'CARD', 'UPI', 'NET_BANKING']).default('COD'),
  notes: z.string().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item').optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  notes: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  search: z.string().optional(),
  customerId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
