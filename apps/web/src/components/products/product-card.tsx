'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { wishlistService } from '../../services/wishlist.service';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  onTryOn?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickAdd, onTryOn }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(wishlistService.isWishlisted(product._id));

    const handleWishlistUpdate = () => {
      setIsWishlisted(wishlistService.isWishlisted(product._id));
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [product._id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = await wishlistService.toggleWishlist(product);
    setIsWishlisted(nextState);
  };

  const handleTryOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTryOn) {
      onTryOn(product);
    }
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
  const hoverImage = product.images?.[1] || mainImage;
  const brandName = typeof product.brandId === 'object' ? product.brandId?.name : '';
  const price = product.price;
  const discountPrice = product.discountPrice;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPct = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  // Distinct sizes and colors from variants
  const sizes = Array.from(new Set((product.variants || []).map((v) => v.size)));
  const colors = (product.variants || [])
    .filter((v, i, self) => i === self.findIndex((t) => t.color?.name === v.color?.name))
    .map((v) => v.color)
    .filter(Boolean);

  return (
    <div className="group relative bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* 1. Image Container */}
      <Link href={`/products/${product.slug || product._id}`} className="relative block aspect-[3/4] overflow-hidden bg-[#F7F1E7]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-[10px] font-bold tracking-wider uppercase">
              {discountPct}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full bg-[#B58B45] text-[#FFFDF8] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              New In
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-[#e11d48] text-[#FFFDF8] shadow-sm'
              : 'bg-[#FFFDF8]/80 text-[#5A3E2B] hover:bg-[#FFFDF8] hover:text-[#e11d48]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Actions on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1.5 z-20">
          {onTryOn && (
            <button
              type="button"
              onClick={handleTryOnClick}
              className="w-full py-2.5 rounded-xl bg-[#FAF4E8]/95 backdrop-blur-md border border-[#B58B45] text-[#5A3E2B] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#5A3E2B] hover:text-[#FFFDF8] hover:border-[#5A3E2B] transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B58B45]" />
              <span>✨ Try on My Virtual Body</span>
            </button>
          )}

          <span className="w-full py-2 rounded-xl bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DED2C2] text-[#2F241D] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#5A3E2B] hover:text-[#FFFDF8] transition-colors shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            View Details
          </span>
        </div>
      </Link>

      {/* 2. Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {brandName && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B58B45] block">
              {brandName}
            </span>
          )}
          <Link href={`/products/${product.slug || product._id}`}>
            <h3 className="font-serif text-sm font-semibold text-[#2F241D] group-hover:text-[#5A3E2B] transition-colors line-clamp-1 mt-0.5">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Color Dots */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-[#DED2C2] shadow-2xs"
                style={{ backgroundColor: c.hexCode }}
                title={c.name}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-[#806F61]">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Size Pills */}
        {sizes.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {sizes.slice(0, 5).map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F7F1E7] text-[#806F61] border border-[#DED2C2]/60"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#DED2C2]/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-base text-[#2F241D]">
              ${hasDiscount ? discountPrice : price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#806F61] line-through">${price}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onTryOn && (
              <button
                type="button"
                onClick={handleTryOnClick}
                className="text-[11px] font-bold text-[#B58B45] hover:text-[#5A3E2B] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-full bg-[#FAF4E8] border border-[#B58B45]/40 hover:border-[#B58B45]"
                title="Try on your custom body avatar"
              >
                <Sparkles className="w-3 h-3" />
                <span>Try On</span>
              </button>
            )}
            <Link
              href={`/products/${product.slug || product._id}`}
              className="text-xs font-semibold text-[#806F61] hover:text-[#5A3E2B] transition-colors"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
