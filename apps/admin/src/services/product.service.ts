import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types';
import { Product, ProductFormData, ProductStatus, Brand, Size, Color } from '../types/product';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}) => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: ProductStatus): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/status`, { status });
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/brands/active');
    return response.data.data;
  },

  getSizes: async (): Promise<Size[]> => {
    const response = await apiClient.get<ApiResponse<Size[]>>('/sizes/active');
    return response.data.data;
  },

  getColors: async (): Promise<Color[]> => {
    const response = await apiClient.get<ApiResponse<Color[]>>('/colors/active');
    return response.data.data;
  },
};
