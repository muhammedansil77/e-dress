export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  errors?: Array<{ field?: string; message: string }>;
}

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  status: CategoryStatus;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeItem extends Category {
  children: CategoryTreeItem[];
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  status: CategoryStatus;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}
