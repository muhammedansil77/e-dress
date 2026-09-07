import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types';

export type CustomerStatus = 'ACTIVE' | 'BLOCKED';

export interface CustomerAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'HOME' | 'WORK' | 'OTHER' | 'SHIPPING' | 'BILLING';
}

export interface CustomerCartItem {
  productId?: {
    _id: string;
    name: string;
    slug?: string;
    images?: string[];
    price?: number;
  } | string;
  variantSku: string;
  quantity: number;
  addedAt?: string;
}

export interface CustomerUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: CustomerStatus;
  addresses?: CustomerAddress[];
  wishlist?: any[];
  cart?: CustomerCartItem[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const customerService = {
  getCustomers: async (params: GetCustomersParams = {}) => {
    const response = await apiClient.get<ApiResponse<CustomerUser[]>>('/users/admin/customers', { params });
    return response.data;
  },

  updateCustomerStatus: async (customerId: string, status: CustomerStatus) => {
    const response = await apiClient.patch<ApiResponse<CustomerUser>>(`/users/admin/customers/${customerId}/status`, { status });
    return response.data.data;
  },
};
