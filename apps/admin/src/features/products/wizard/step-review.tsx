'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData, Brand } from '../../../types/product';
import { CategoryTreeItem } from '../../../types';
import {
  CheckCircle2,
  FolderTree,
  DollarSign,
  Boxes,
  Palette,
  Star,
  Sparkle,
  Flame,
  Tag,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

interface StepReviewProps {
  form: UseFormReturn<ProductFormData>;
  categoryTree: CategoryTreeItem[];
  brands: Brand[];
  isSubmitting: boolean;
  onSubmit: (statusOverride?: 'ACTIVE' | 'DRAFT') => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  form,
  categoryTree,
  brands,
  isSubmitting,
  onSubmit,
}) => {
  const { watch, setValue } = form;

  const values = watch();
  const images = values.images || [];
  const variants = values.variants || [];
  const coverImage = images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80';

  // Category and Brand labels
  const rootCat = categoryTree.find((c) => c._id === values.categoryId);
  const subCat = rootCat?.children?.find((s) => s._id === values.subcategoryId);
  const brandObj = brands.find((b) => b._id === values.brandId);

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const hasDiscount = values.discountPrice !== null && values.discountPrice !== undefined && values.discountPrice > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-coffee-900">Review & Publish Product</h3>
        <p className="text-xs text-coffee-600">
          Verify all apparel specifications, imagery, variants, and pricing before publishing.
        </p>
      </div>

      {/* Main Preview Card */}
      <div className="p-6 rounded-3xl border border-cream-400 bg-cream-50 shadow-sm flex flex-col md:flex-row gap-6">
        {/* Cover Photo */}
        <div className="w-full md:w-56 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200 border border-cream-400 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={values.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as any).src =
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80';
            }}
          />
        </div>

        {/* Details Column */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Hierarchy & Brand */}
            <div className="flex items-center gap-2 text-xs text-coffee-600 font-semibold mb-1">
              <span>{brandObj?.name || 'In-House Brand'}</span>
              <span>•</span>
              <span className="text-gold-600 font-bold">
                {rootCat?.name || 'Department'} {subCat && `> ${subCat.name}`}
              </span>
            </div>

            {/* Title & SKU */}
            <h2 className="text-xl font-black text-coffee-900 tracking-tight">
              {values.name || 'Untitled Dress'}
            </h2>
            <p className="font-mono text-xs text-coffee-600 mt-0.5">SKU: {values.sku || 'N/A'}</p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {values.isFeatured && (
                <Badge variant="gold" size="sm">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
              {values.isNewArrival && (
                <Badge variant="info" size="sm">
                  <Sparkle className="w-3 h-3 mr-1" /> New Arrival
                </Badge>
              )}
              {values.isBestseller && (
                <Badge variant="danger" size="sm">
                  <Flame className="w-3 h-3 mr-1" /> Bestseller
                </Badge>
              )}
              <Badge variant="neutral" size="sm">
                Status: {values.status || 'ACTIVE'}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xs text-coffee-700 mt-3 line-clamp-2 leading-relaxed">
              {values.shortDescription || values.description || 'No description provided.'}
            </p>
          </div>

          {/* Pricing & Stock Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-cream-100/80 border border-cream-400/70">
            <div>
              <span className="text-[10px] uppercase font-bold text-coffee-600">Retail Price</span>
              <p className="text-base font-black text-coffee-900">
                ${hasDiscount ? values.discountPrice?.toFixed(2) : values.price?.toFixed(2) || '0.00'}
              </p>
              {hasDiscount && (
                <p className="text-[10px] text-coffee-600 line-through">${values.price?.toFixed(2)}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-coffee-600">Variants</span>
              <p className="text-base font-black text-coffee-900">
                {variants.length} SKU(s)
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-coffee-600">Total Stock</span>
              <p className="text-base font-black text-gold-600">
                {totalStock} units
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-coffee-600">Photos</span>
              <p className="text-base font-black text-coffee-900">
                {images.length} images
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publish or Save as Draft Actions */}
      <div className="p-5 rounded-2xl bg-cream-100/80 border border-cream-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-coffee-900">
            Ready to finalize product?
          </h4>
          <p className="text-[11px] text-coffee-600">
            You can publish immediately to activate on the store, or save as Draft.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isSubmitting}
            onClick={() => {
              setValue('status', 'DRAFT');
              onSubmit('DRAFT');
            }}
            className="flex-1 sm:flex-initial"
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={() => {
              setValue('status', 'ACTIVE');
              onSubmit('ACTIVE');
            }}
            className="flex-1 sm:flex-initial shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Product</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
