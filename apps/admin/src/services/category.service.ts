import { apiClient } from '../lib/api-client';
import { ApiResponse, Category, CategoryFormData, CategoryTreeItem, CategoryStatus } from '../types';

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
  parentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const categoryService = {
  getCategories: async (params: GetCategoriesParams = {}) => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  getCategoryTree: async (): Promise<CategoryTreeItem[]> => {
    const response = await apiClient.get<ApiResponse<CategoryTreeItem[]>>('/categories/tree');
    return response.data.data;
  },

  getActiveCategories: async (): Promise<Array<{ _id: string; name: string; slug: string; parentId?: string }>> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/categories/active');
    return response.data.data;
  },

  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: CategoryStatus): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/status`, { status });
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
