'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cartService, LocalCartItem } from '../../services/cart.service';
import { CartSummary } from '../../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
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

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EFE5D5] flex items-center justify-center mx-auto text-[#5A3E2B]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2F241D]">Your Bag is Empty</h2>
        <p className="text-xs text-[#806F61]">Discover our festive sarees, georgette maxis, and embroidered kurti sets.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#5A3E2B] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#DED2C2] pb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
          Review Selection
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2F241D]">
          Shopping Bag ({summary?.totalQuantity || 0} Pieces)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Table of items: 8 Cols */}
        <div className="lg:col-span-8 bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] divide-y divide-[#DED2C2] shadow-xs">
          {items.map((item) => {
            const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.price;
            return (
              <div key={item.variant.sku} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-20 h-24 rounded-lg object-cover border border-[#DED2C2] flex-shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#2F241D]">{item.product.name}</h3>
                  <p className="text-xs text-[#806F61]">
                    Size: <strong className="text-[#5A3E2B]">{item.variant.size}</strong> • Color: {item.variant.color?.name || 'Standard'}
                  </p>
                  <p className="text-xs text-[#806F61] font-mono">SKU: {item.variant.sku}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-[#DED2C2] rounded-lg bg-[#F7F1E7]">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.variant.sku, item.quantity - 1)}
                    className="p-1.5 text-[#806F61] hover:text-[#2F241D]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#2F241D]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.variant.sku, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock}
                    className="p-1.5 text-[#806F61] hover:text-[#2F241D] disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Item Total & Remove */}
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="font-serif font-bold text-lg text-[#2F241D]">
                    ${(price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.variant.sku)}
                    className="text-xs text-[#806F61] hover:text-[#e11d48] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary: 4 Cols */}
        {summary && (
          <div className="lg:col-span-4 bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-6 space-y-6 shadow-xs sticky top-28">
            <h3 className="font-serif font-bold text-lg text-[#2F241D] border-b border-[#DED2C2] pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#806F61]">
                <span>Subtotal</span>
                <span className="text-[#2F241D] font-semibold">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#806F61]">
                <span>Estimated Tax (5% GST)</span>
                <span className="text-[#2F241D] font-semibold">${summary.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#806F61]">
                <span>Shipping</span>
                <span className="font-semibold text-[#2F241D]">
                  {summary.shippingFee === 0 ? <span className="text-[#059669]">FREE</span> : `$${summary.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-[#DED2C2] font-serif font-bold text-[#2F241D]">
                <span>Estimated Total</span>
                <span className="text-[#5A3E2B] text-xl">${summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
