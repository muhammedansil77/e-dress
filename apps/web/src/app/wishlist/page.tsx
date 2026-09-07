'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wishlistService } from '../../services/wishlist.service';
import { Product } from '../../types';
import { Heart, ArrowRight, Trash2, Eye } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);

  const loadWishlist = () => {
    setItems(wishlistService.getLocalWishlist());
  };

  useEffect(() => {
    loadWishlist();

    const handleUpdate = () => loadWishlist();
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  const handleRemove = async (product: Product) => {
    await wishlistService.toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#DED2C2] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
            Personal Atelier
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2F241D]">
            Saved Wishlist ({items.length})
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold uppercase tracking-widest text-[#5A3E2B] hover:text-[#B58B45] transition-colors flex items-center gap-1"
        >
          Discover More Pieces <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid or Empty */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFDF8] rounded-3xl border border-[#DED2C2] p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#fdf2f8] flex items-center justify-center mx-auto text-[#e11d48]">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2F241D]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#806F61] max-w-sm mx-auto">
            Save your favorite dresses, festive kurtis, and silk sarees to review them anytime.
          </p>
          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="mt-2 px-6 py-3 rounded-xl bg-[#5A3E2B] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#432C1D] transition-colors"
          >
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => {
            const image = p.images?.[0] || '';
            const price = p.price;
            const discountPrice = p.discountPrice;
            const hasDiscount = discountPrice && discountPrice < price;

            return (
              <div
                key={p._id}
                className="bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F1E7]">
                  <img src={image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    type="button"
                    onClick={() => handleRemove(p)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFDF8]/90 text-[#e11d48] hover:bg-[#e11d48] hover:text-[#FFFDF8] flex items-center justify-center transition-colors shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-[#2F241D] line-clamp-1">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif font-bold text-base text-[#2F241D]">
                        ${hasDiscount ? discountPrice : price}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#806F61] line-through">${price}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/products/${p.slug || p._id}`)}
                    className="w-full py-2.5 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Select Size & Buy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
