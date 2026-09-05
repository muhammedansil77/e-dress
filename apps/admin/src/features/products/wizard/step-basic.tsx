'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData, Brand } from '../../../types/product';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Sparkles, Tag, Star, Flame, Sparkle } from 'lucide-react';

interface StepBasicProps {
  form: UseFormReturn<ProductFormData>;
  brands: Brand[];
}

export const StepBasic: React.FC<StepBasicProps> = ({ form, brands }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const [tagInput, setTagInput] = useState('');
  const watchName = watch('name');
  const watchSlug = watch('slug');
  const watchSku = watch('sku');
  const watchTags = watch('tags') || [];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val, { shouldValidate: true });
    if (!watchSlug || watchSlug.trim() === '') {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setValue('slug', slug, { shouldValidate: false });
    }
    if (!watchSku || watchSku.trim() === '') {
      const prefix = (val || 'DRS').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'DRS';
      const rand = Math.floor(1000 + Math.random() * 9000);
      setValue('sku', `${prefix}-${rand}`, { shouldValidate: false });
    }
  };

  const handleGenerateSlug = () => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setValue('slug', slug, { shouldValidate: true });
    }
  };

  const handleGenerateSku = () => {
    const prefix = (watchName || 'DRS').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'DRS';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setValue('sku', `${prefix}-${rand}`, { shouldValidate: true });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !watchTags.includes(trimmed)) {
      setValue('tags', [...watchTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchTags.filter((t) => t !== tagToRemove)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-coffee-900">Basic Product Information</h3>
        <p className="text-xs text-coffee-600">
          Enter the primary identity, descriptions, merchandising badges, and tags for this apparel dress.
        </p>
      </div>

      {/* Name, Slug, SKU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <Input
            label="Product / Dress Title *"
            placeholder="e.g. Bohemian Tiered Floral Maxi Dress"
            {...register('name')}
            onChange={handleNameChange}
            error={errors.name?.message}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-coffee-900">
              URL Slug
            </label>
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="text-[11px] text-gold-600 hover:text-gold-500 flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-generate</span>
            </button>
          </div>
          <input
            {...register('slug')}
            placeholder="bohemian-tiered-floral-maxi-dress"
            className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all shadow-sm"
          />
          {errors.slug && <p className="text-xs text-rose-700 mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-coffee-900">
              Base SKU
            </label>
            <button
              type="button"
              onClick={handleGenerateSku}
              className="text-[11px] text-gold-600 hover:text-gold-500 flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-generate</span>
            </button>
          </div>
          <input
            {...register('sku')}
            placeholder="DRS-4821"
            className="w-full uppercase rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 font-mono transition-all shadow-sm"
          />
          {errors.sku && <p className="text-xs text-rose-700 mt-1">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-coffee-900 mb-1.5">
            Brand / Designer
          </label>
          <select
            {...register('brandId')}
            className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 cursor-pointer transition-all shadow-sm"
          >
            <option value="">Select Brand (Optional)</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-4">
        <Input
          label="Short Summary Description"
          placeholder="e.g. A breezy georgette tiered silhouette ideal for tropical evenings and cocktail garden parties."
          {...register('shortDescription')}
          error={errors.shortDescription?.message}
        />

        <Textarea
          label="Detailed Product Description & Styling Notes"
          placeholder="Include fabric composition (e.g. 100% Georgette with viscose lining), sleeve details, care instructions, and fit guidance..."
          rows={4}
          {...register('description')}
          error={errors.description?.message}
        />
      </div>

      {/* Merchandising Badges */}
      <div>
        <label className="block text-xs font-bold text-coffee-900 mb-2">
          Merchandising Badges
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-cream-400 bg-cream-100/60 cursor-pointer hover:border-gold-500 transition-colors shadow-sm">
            <input
              type="checkbox"
              {...register('isFeatured')}
              className="w-4 h-4 rounded text-coffee-700 focus:ring-gold-500 accent-coffee-700"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-coffee-900">
              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
              <span>Featured Product</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-cream-400 bg-cream-100/60 cursor-pointer hover:border-gold-500 transition-colors shadow-sm">
            <input
              type="checkbox"
              {...register('isNewArrival')}
              className="w-4 h-4 rounded text-coffee-700 focus:ring-gold-500 accent-coffee-700"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-coffee-900">
              <Sparkle className="w-4 h-4 text-gold-600" />
              <span>New Arrival</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-cream-400 bg-cream-100/60 cursor-pointer hover:border-gold-500 transition-colors shadow-sm">
            <input
              type="checkbox"
              {...register('isBestseller')}
              className="w-4 h-4 rounded text-coffee-700 focus:ring-gold-500 accent-coffee-700"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-coffee-900">
              <Flame className="w-4 h-4 text-amber-700" />
              <span>Bestseller</span>
            </div>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-coffee-900 mb-1.5">
          Product Search Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Type tag (e.g. maxi, floral, cotton) and press Enter"
            className="flex-1 rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 text-coffee-900 border border-cream-400 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>

        {watchTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {watchTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cream-200 text-coffee-800 border border-cream-300 text-xs font-medium shadow-sm"
              >
                <Tag className="w-3 h-3 text-gold-600" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-700 font-bold ml-1 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
