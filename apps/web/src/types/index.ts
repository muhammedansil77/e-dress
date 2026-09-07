export interface ProductColor {
  name: string;
  hexCode: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  color: ProductColor;
  size: string;
  stock: number;
  price: number;
  discountPrice?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: { _id: string; name: string; slug: string } | string;
  subcategoryId?: { _id: string; name: string; slug: string } | string;
  brandId?: { _id: string; name: string; slug: string } | string;
  images: string[];
  price: number;
  discountPrice?: number;
  tax: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  tags: string[];
  variants: ProductVariant[];
  totalStock: number;
  createdAt: string;
}

export interface ProductFilterFacets {
  priceRange: { min: number; max: number };
  sizes: Array<{ code: string; count: number }>;
  colors: Array<{ name: string; hexCode: string; count: number }>;
  brands: Array<{ _id: string; name: string; count: number }>;
  categories: Array<{ _id: string; name: string; count: number }>;
  totalProducts: number;
}

export interface CartItem {
  _id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  brandName?: string;
  thumbnail: string;
  variantSku: string;
  color: ProductColor;
  size: string;
  price: number;
  discountPrice?: number;
  effectivePrice: number;
  quantity: number;
  itemTotal: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  estimatedTax: number;
  shippingFee: number;
  grandTotal: number;
  totalQuantity: number;
  freeShippingEligible: boolean;
}

export interface OrderItem {
  productId: string;
  variantSku: string;
  productTitle: string;
  productSlug?: string;
  thumbnail?: string;
  size: string;
  colorName: string;
  colorHex?: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  tax: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  placedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}
