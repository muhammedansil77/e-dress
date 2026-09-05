import { apiClient } from '../lib/api-client';
import { ApiResponse, AdminUser } from '../types';

export interface LoginResponseData {
  admin: AdminUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApiService = {
  login: async (email: string, password: string): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/admin/login', {
      email,
      password,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/admin/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
      }
    }
  },

  getProfile: async (): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>('/auth/admin/me');
    return response.data.data;
  },
};
