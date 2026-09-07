import { Document, Types } from 'mongoose';

export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface IAddress {
  _id?: Types.ObjectId;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: AddressType;
}

export interface ICartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  variantSku: string;
  quantity: number;
  addedAt?: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  addresses: IAddress[];
  wishlist: Types.ObjectId[];
  cart: ICartItem[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPopulatedCartItem {
  _id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  brandName?: string;
  thumbnail: string;
  variantSku: string;
  color: {
    name: string;
    hexCode: string;
  };
  size: string;
  price: number;
  discountPrice?: number;
  effectivePrice: number;
  quantity: number;
  itemTotal: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface ICartSummary {
  items: IPopulatedCartItem[];
  subtotal: number;
  discountTotal: number;
  estimatedTax: number;
  shippingFee: number;
  grandTotal: number;
  totalQuantity: number;
  freeShippingEligible: boolean;
}

export interface UserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
