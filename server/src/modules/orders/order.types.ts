import { Document, Types } from 'mongoose';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'COD' | 'CARD' | 'UPI' | 'NET_BANKING';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface IOrderItem {
  productId: Types.ObjectId | string;
  variantSku: string;
  productTitle: string;
  productSlug?: string;
  thumbnail?: string;
  size: string;
  colorName: string;
  colorHex?: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface IOrderShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  orderNumber: string;
  customerId?: Types.ObjectId | string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: IOrderShippingAddress;
  subtotal: number;
  discountTotal: number;
  tax: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  placedAt: Date;
  cancelledAt?: Date | null;
  deliveredAt?: Date | null;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: IOrderShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  // If placing directly from payload (for guest or direct buy)
  items?: Array<{
    productId: string;
    variantSku: string;
    quantity: number;
  }>;
}

export interface OrderQueryFilters {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
