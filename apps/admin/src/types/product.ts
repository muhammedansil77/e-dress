export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface Size {
  _id: string;
  name: string;
  code: string;
  sortOrder: number;
}

export interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

export interface ProductVariant {
  _id?: string;
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
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategoryId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  brandId?: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  } | null;
  images: string[];
  price: number;
  discountPrice?: number;
  tax: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariant[];
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  images: string[];
  price: number;
  discountPrice?: number | null;
  tax: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariant[];
}
