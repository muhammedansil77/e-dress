import { ProductStatus } from './product.types';

export interface CreateVariantDTO {
  sku: string;
  color: {
    name: string;
    hexCode: string;
  };
  size: string;
  price?: number;
  discountPrice?: number;
  stock: number;
  image?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateProductDTO {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  images?: string[];
  price: number;
  discountPrice?: number | null;
  tax?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  variants?: CreateVariantDTO[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: 'price' | 'createdAt' | 'name' | 'totalStock';
  sortOrder?: 'asc' | 'desc';
}
