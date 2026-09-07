import { apiClient } from '../lib/api-client';
import { Product, ProductFilterFacets, Category } from '../types';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  department?: string;
  sizes?: string;
  colors?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  getProducts: async (params: ProductQuery = {}) => {
    const res = await apiClient.get('/products', { params });
    // Normalize response shape: either array directly or { products: [], total: ... }
    const raw = res.data.data;
    const items: Product[] = Array.isArray(raw) ? raw : raw?.products || [];
    const meta = res.data.meta || {
      total: items.length,
      page: params.page || 1,
      limit: params.limit || 12,
      totalPages: 1,
    };
    return { products: items, meta };
  },

  getProductBySlugOrId: async (slugOrId: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${slugOrId}`);
    return res.data.data;
  },

  getFilterFacets: async (params: { category?: string; brand?: string; department?: string } = {}): Promise<ProductFilterFacets> => {
    const res = await apiClient.get('/products/filters', { params });
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/categories/active');
      return res.data.data || [];
    } catch {
      return [];
    }
  },
};
