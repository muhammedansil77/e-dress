import { Document, Types } from 'mongoose';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface IProductVariant {
  _id?: Types.ObjectId;
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

export interface IProduct {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId | null;
  brandId?: Types.ObjectId | null;
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
  variants: IProductVariant[];
  totalStock: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document<Types.ObjectId> {}
