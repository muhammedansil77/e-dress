import { apiClient } from '../lib/api-client';
import { Product } from '../types';

const LOCAL_WISHLIST_KEY = 'haute_wishlist_items';

export const wishlistService = {
  getLocalWishlist: (): Product[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isWishlisted: (productId: string): boolean => {
    const list = wishlistService.getLocalWishlist();
    return list.some((p) => p._id === productId);
  },

  toggleWishlist: async (product: Product): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;

    if (token) {
      try {
        const res = await apiClient.post(`/users/wishlist/${product._id}/toggle`);
        const inWishlist = res.data.data?.inWishlist;
        window.dispatchEvent(new Event('wishlist-updated'));
        return !!inWishlist;
      } catch {
        // Fallback to local
      }
    }

    const current = wishlistService.getLocalWishlist();
    const index = current.findIndex((p) => p._id === product._id);
    let inWishlist = false;

    if (index > -1) {
      current.splice(index, 1);
      inWishlist = false;
    } else {
      current.push(product);
      inWishlist = true;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event('wishlist-updated'));
    }

    return inWishlist;
  },
};
