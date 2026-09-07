import { apiClient } from '../lib/api-client';
import { CartItem, CartSummary, Product, ProductVariant } from '../types';

const LOCAL_CART_KEY = 'haute_cart_items';

export interface LocalCartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export const cartService = {
  // Get guest items from localStorage
  getLocalCart: (): LocalCartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save guest items to localStorage
  saveLocalCart: (items: LocalCartItem[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  },

  // Add item to cart
  addItem: async (product: Product, variant: ProductVariant, quantity = 1): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;

    if (token) {
      try {
        await apiClient.post('/users/cart', {
          productId: product._id,
          variantSku: variant.sku,
          quantity,
        });
        window.dispatchEvent(new Event('cart-updated'));
        return;
      } catch (err) {
        console.warn('Backend cart sync failed, falling back to local state', err);
      }
    }

    // Guest fallback
    const local = cartService.getLocalCart();
    const existingIndex = local.findIndex((i) => i.variant.sku === variant.sku);
    if (existingIndex > -1) {
      local[existingIndex].quantity += quantity;
    } else {
      local.push({ product, variant, quantity });
    }
    cartService.saveLocalCart(local);
  },

  // Update item quantity
  updateQuantity: async (variantSku: string, quantity: number): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;

    if (token) {
      try {
        if (quantity <= 0) {
          await apiClient.delete(`/users/cart/${variantSku}`);
        } else {
          await apiClient.patch(`/users/cart/${variantSku}`, { quantity });
        }
        window.dispatchEvent(new Event('cart-updated'));
        return;
      } catch (err) {
        console.warn('Backend cart update failed', err);
      }
    }

    const local = cartService.getLocalCart();
    if (quantity <= 0) {
      const filtered = local.filter((i) => i.variant.sku !== variantSku);
      cartService.saveLocalCart(filtered);
    } else {
      const item = local.find((i) => i.variant.sku === variantSku);
      if (item) {
        item.quantity = quantity;
        cartService.saveLocalCart(local);
      }
    }
  },

  // Remove item
  removeItem: async (variantSku: string): Promise<void> => {
    await cartService.updateQuantity(variantSku, 0);
  },

  // Clear cart
  clearCart: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_CART_KEY);
      window.dispatchEvent(new Event('cart-updated'));
    }
  },

  // Calculate cart summary
  calculateSummary: (localItems: LocalCartItem[]): CartSummary => {
    let subtotal = 0;
    let totalQuantity = 0;

    const items: CartItem[] = localItems.map((item) => {
      const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      totalQuantity += item.quantity;

      return {
        _id: item.variant.sku,
        productId: item.product._id,
        productTitle: item.product.name,
        productSlug: item.product.slug,
        thumbnail: item.product.images?.[0] || '',
        variantSku: item.variant.sku,
        color: item.variant.color,
        size: item.variant.size,
        price: item.variant.price,
        discountPrice: item.variant.discountPrice,
        effectivePrice: price,
        quantity: item.quantity,
        itemTotal,
        availableStock: item.variant.stock,
        isAvailable: item.variant.stock >= item.quantity,
      };
    });

    const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
    const freeShippingEligible = subtotal >= 75 || subtotal === 0;
    const shippingFee = freeShippingEligible ? 0 : 10;
    const grandTotal = Math.round((subtotal + estimatedTax + shippingFee) * 100) / 100;

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: 0,
      estimatedTax,
      shippingFee,
      grandTotal,
      totalQuantity,
      freeShippingEligible,
    };
  },
};
