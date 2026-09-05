import { CategoryStatus } from './category.types';

export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  status?: CategoryStatus;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  status?: CategoryStatus;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
  parentId?: string | null;
  sortBy?: 'name' | 'displayOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  includeChildren?: boolean;
}
