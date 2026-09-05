'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../../../types/product';
import { Input } from '../../../components/ui/input';
import { DollarSign, Percent, TrendingDown, ShieldCheck } from 'lucide-react';

interface StepPricingProps {
  form: UseFormReturn<ProductFormData>;
}

export const StepPricing: React.FC<StepPricingProps> = ({ form }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const price = watch('price') || 0;
  const discountPrice = watch('discountPrice');
  const tax = watch('tax') || 0;

  const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const savings = hasDiscount ? (price - discountPrice).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-coffee-900">Pricing & Taxation</h3>
        <p className="text-xs text-coffee-600">
          Set base regular price, promotional sale discount, and tax rate.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Input
            type="number"
            step="0.01"
            label="Base Regular Price ($) *"
            placeholder="99.00"
            leftIcon={<DollarSign className="w-4 h-4" />}
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
        </div>

        <div>
          <Input
            type="number"
            step="0.01"
            label="Discount Sale Price ($)"
            placeholder="79.00 (Optional)"
            leftIcon={<DollarSign className="w-4 h-4" />}
            {...register('discountPrice', {
              setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
            })}
            helperText="Leave empty if not currently on sale"
          />
        </div>

        <div>
          <Input
            type="number"
            step="0.1"
            label="Tax / GST Rate (%)"
            placeholder="5"
            leftIcon={<Percent className="w-4 h-4" />}
            {...register('tax', { valueAsNumber: true })}
            helperText="Applicable sales tax or VAT rate"
          />
        </div>
      </div>

      {/* Live Pricing Breakdown Card */}
      <div className="p-5 rounded-2xl bg-cream-200/80 border border-cream-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600">
            Storefront Price Preview
          </span>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span className="text-2xl font-black text-coffee-900">
              ${hasDiscount ? discountPrice?.toFixed(2) : price?.toFixed(2) || '0.00'}
            </span>
            {hasDiscount && (
              <span className="text-sm font-semibold line-through text-coffee-600">
                ${price.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-gold-500/20 text-gold-700 border border-gold-500/40">
                {discountPercent}% OFF (Save ${savings})
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-coffee-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-500" />
          <span>Tax included at checkout (+{tax}%)</span>
        </div>
      </div>
    </div>
  );
};
