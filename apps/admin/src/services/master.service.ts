import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types';
import { Size, Color } from '../types/product';

export interface CreateSizeDTO {
  name: string;
  code: string;
  sortOrder?: number;
}

export interface CreateColorDTO {
  name: string;
  hexCode: string;
}

export const masterService = {
  getSizes: async (): Promise<Size[]> => {
    const response = await apiClient.get<ApiResponse<Size[]>>('/sizes');
    return response.data.data;
  },

  getActiveSizes: async (): Promise<Size[]> => {
    const response = await apiClient.get<ApiResponse<Size[]>>('/sizes/active');
    return response.data.data;
  },

  createSize: async (data: CreateSizeDTO): Promise<Size> => {
    const response = await apiClient.post<ApiResponse<Size>>('/sizes', data);
    return response.data.data;
  },

  getColors: async (): Promise<Color[]> => {
    const response = await apiClient.get<ApiResponse<Color[]>>('/colors');
    return response.data.data;
  },

  getActiveColors: async (): Promise<Color[]> => {
    const response = await apiClient.get<ApiResponse<Color[]>>('/colors/active');
    return response.data.data;
  },

  createColor: async (data: CreateColorDTO): Promise<Color> => {
    const response = await apiClient.post<ApiResponse<Color>>('/colors', data);
    return response.data.data;
  },
};
