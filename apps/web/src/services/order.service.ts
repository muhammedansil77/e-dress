import { apiClient } from '../lib/api-client';
import { Order } from '../types';

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  notes?: string;
  items: Array<{
    productId: string;
    variantSku: string;
    quantity: number;
  }>;
}

export const orderService = {
  checkout: async (payload: CheckoutPayload): Promise<Order> => {
    const res = await apiClient.post('/orders/checkout', payload);
    return res.data.data;
  },

  getOrderById: async (idOrNumber: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/track/${idOrNumber}`);
    return res.data.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get('/orders/my-orders');
    return res.data.data || [];
  },
};
