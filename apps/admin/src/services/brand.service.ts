import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types';
import { Brand } from '../types/product';

export interface CreateBrandDTO {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  website?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const brandService = {
  getBrands: async (params: GetBrandsParams = {}) => {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/brands', { params });
    return response.data;
  },

  getActiveBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/brands/active');
    return response.data.data;
  },

  getBrandById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
    return response.data.data;
  },

  createBrand: async (data: CreateBrandDTO): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>('/brands', data);
    return response.data.data;
  },

  updateBrand: async (id: string, data: Partial<CreateBrandDTO>): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(`/brands/${id}`, data);
    return response.data.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },
};
