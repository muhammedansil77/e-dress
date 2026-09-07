'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { cartService, LocalCartItem } from '../../services/cart.service';
import { CartSummary } from '../../types';
import { formatPrice } from '../../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);

  const loadCart = () => {
    const local = cartService.getLocalCart();
    setItems(local);
    setSummary(cartService.calculateSummary(local));
  };

  useEffect(() => {
    loadCart();

    const handleUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleUpdate);
    return () => window.removeEventListener('cart-updated', handleUpdate);
  }, []);

  const handleUpdateQty = (sku: string, qty: number) => {
    cartService.updateQuantity(sku, qty);
  };

  const handleRemove = (sku: string) => {
    cartService.removeItem(sku);
  };

  const handleProceedToCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  const freeShippingNeeded = Math.max(0, 75 - (summary?.subtotal || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2F241D]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF8] border-l border-[#DED2C2] shadow-2xl flex flex-col">
          {/* 1. Header */}
          <div className="p-5 border-b border-[#DED2C2] flex items-center justify-between bg-[#F7F1E7]/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5A3E2B]" />
              <h3 className="font-serif text-lg font-bold text-[#2F241D]">Your Shopping Bag</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8D5B5] text-[#5A3E2B] font-bold">
                {summary?.totalQuantity || 0}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#806F61] hover:text-[#2F241D] hover:bg-[#EFE5D5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Free Shipping Indicator */}
          <div className="px-5 py-3 bg-[#E8D5B5]/40 border-b border-[#DED2C2] text-xs text-[#5A3E2B]">
            {freeShippingNeeded > 0 ? (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#B58B45]" />
                  <span>
                    Add <strong className="text-[#5A3E2B] font-serif font-bold">${freeShippingNeeded.toFixed(2)}</strong> more for <strong>Free Express Delivery</strong>!
                  </span>
                </p>
                <div className="w-full bg-[#DED2C2] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#B58B45] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (((summary?.subtotal || 0) / 75) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-[#059669] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You unlocked <strong>Free Express Delivery</strong>!</span>
              </p>
            )}
          </div>

          {/* 3. Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#DED2C2]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#F7F1E7] border border-[#DED2C2] flex items-center justify-center text-[#5A3E2B] mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#806F61]" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2F241D]">Your bag is empty</h4>
                <p className="text-xs text-[#806F61] mt-1 max-w-xs">
                  Discover our festive sarees, georgette maxis, and embroidered kurti sets.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/shop');
                  }}
                  className="mt-5 px-6 py-2.5 rounded-lg bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.price;
                const image = item.product.images?.[0];

                return (
                  <div key={item.variant.sku} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#F7F1E7] border border-[#DED2C2] flex-shrink-0">
                      {image ? (
                        <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#806F61] text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-[#2F241D] line-clamp-1 hover:text-[#5A3E2B]">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.variant.sku)}
                            className="text-[#806F61] hover:text-[#e11d48] p-0.5 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant Info: Size & Color */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-[#EFE5D5] text-[10px] font-bold text-[#5A3E2B]">
                            Size: {item.variant.size}
                          </span>
                          {item.variant.color && (
                            <span className="flex items-center gap-1 text-[10px] text-[#806F61]">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-[#DED2C2]"
                                style={{ backgroundColor: item.variant.color.hexCode || '#000' }}
                              />
                              {item.variant.color.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#DED2C2] rounded-lg bg-[#F7F1E7]">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant.sku, item.quantity - 1)}
                            className="p-1 text-[#806F61] hover:text-[#2F241D] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#2F241D]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant.sku, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock}
                            className="p-1 text-[#806F61] hover:text-[#2F241D] disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-[#2F241D]">
                            ${(price * item.quantity).toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-[#806F61]">
                              ${price} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Checkout Summary & Action Footer */}
          {items.length > 0 && summary && (
            <div className="p-5 border-t border-[#DED2C2] bg-[#F7F1E7]/70 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#806F61]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2F241D]">${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#806F61]">
                  <span>Estimated Tax (5% GST)</span>
                  <span className="font-semibold text-[#2F241D]">${summary.estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#806F61]">
                  <span>Express Shipping</span>
                  <span className="font-semibold text-[#2F241D]">
                    {summary.shippingFee === 0 ? (
                      <span className="text-[#059669] font-bold">FREE</span>
                    ) : (
                      `$${summary.shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#DED2C2] font-serif font-bold text-[#2F241D]">
                  <span>Estimated Total</span>
                  <span className="text-[#5A3E2B] text-base">${summary.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-md hover:shadow transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[10px] text-center text-[#806F61] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B58B45]" />
                <span>Encrypted 256-Bit SSL Checkout & Guaranteed Delivery</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
