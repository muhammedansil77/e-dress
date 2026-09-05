'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../../../types/product';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Globe, Search, Sparkles } from 'lucide-react';

interface StepSeoProps {
  form: UseFormReturn<ProductFormData>;
}

export const StepSeo: React.FC<StepSeoProps> = ({ form }) => {
  const { register, watch, setValue } = form;

  const watchName = watch('name') || '';
  const watchSlug = watch('slug') || '';
  const watchSeoTitle = watch('seoTitle') || '';
  const watchSeoDesc = watch('seoDescription') || '';
  const watchShortDesc = watch('shortDescription') || '';

  const handleAutoFillSeo = () => {
    if (watchName && !watchSeoTitle) {
      setValue('seoTitle', `${watchName} | Haute Apparel Collection`);
    }
    if (watchShortDesc && !watchSeoDesc) {
      setValue('seoDescription', watchShortDesc);
    }
  };

  const previewTitle = watchSeoTitle || `${watchName || 'Designer Apparel Product'} | Haute Apparel`;
  const previewSlug = watchSlug || 'product-slug';
  const previewDesc =
    watchSeoDesc ||
    watchShortDesc ||
    'Shop the finest dresses, ethnic apparel, and contemporary clothing at Haute Apparel. Enjoy free shipping and easy returns.';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-coffee-900">Search Engine Optimization (SEO)</h3>
          <p className="text-xs text-coffee-600">
            Customize how this dress appears in Google search results and social media shares.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoFillSeo}
          className="text-xs text-coffee-900 hover:text-gold-600 font-semibold flex items-center gap-1.5 p-2 rounded-xl bg-cream-200 border border-cream-300 shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span>Auto-fill from Info</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-coffee-900">
              SEO Page Title
            </label>
            <span className="text-[11px] text-coffee-600">{watchSeoTitle.length}/60 chars</span>
          </div>
          <input
            {...register('seoTitle')}
            placeholder="e.g. Bohemian Tiered Floral Maxi Dress | Haute Apparel"
            className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-coffee-900">
              Meta Description
            </label>
            <span className="text-[11px] text-coffee-600">{watchSeoDesc.length}/160 chars</span>
          </div>
          <textarea
            {...register('seoDescription')}
            rows={3}
            placeholder="e.g. Discover our breezy georgette floral maxi dress with flutter sleeves and tiered silhouette. Free standard delivery available."
            className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm"
          />
        </div>
      </div>

      {/* Google Search Snippet Live Preview */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-bold text-coffee-900 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-coffee-600" />
          <span>Search Engine Snippet Live Preview</span>
        </label>

        <div className="p-4 rounded-2xl border border-cream-400 bg-cream-50 font-sans shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-coffee-700 flex items-center justify-center text-cream-50 text-[9px] font-bold">
              H
            </div>
            <span className="text-[11px] text-coffee-600 truncate">
              https://haute-apparel.com/products/{previewSlug}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
            {previewTitle}
          </h4>

          <p className="text-xs text-coffee-700 line-clamp-2 mt-1 leading-relaxed">
            {previewDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
