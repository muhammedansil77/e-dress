import { AdminRole } from './roles';

export enum Permission {
  // Categories
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Products
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Orders
  ORDER_READ = 'order:read',
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',

  // Customers
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',

  // Coupons
  COUPON_MANAGE = 'coupon:manage',

  // Banners
  BANNER_MANAGE = 'banner:manage',

  // Reviews
  REVIEW_MANAGE = 'review:manage',

  // Reports
  REPORT_READ = 'report:read',

  // Settings & Admins
  SETTING_MANAGE = 'setting:manage',
  ADMIN_MANAGE = 'admin:manage',
}

export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: ALL_PERMISSIONS,
  [AdminRole.ADMIN]: [
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_UPDATE,
    Permission.COUPON_MANAGE,
    Permission.BANNER_MANAGE,
    Permission.REVIEW_MANAGE,
    Permission.REPORT_READ,
  ],
  [AdminRole.MANAGER]: [
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.CUSTOMER_READ,
    Permission.REPORT_READ,
  ],
  [AdminRole.STAFF]: [
    Permission.CATEGORY_READ,
    Permission.PRODUCT_READ,
    Permission.ORDER_READ,
    Permission.CUSTOMER_READ,
  ],
};
