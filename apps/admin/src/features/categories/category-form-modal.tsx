'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Category, CategoryFormData } from '../../types';
import { Sparkles, Image as ImageIcon, Globe, Layers, AlertCircle, Upload } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(1000).optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  displayOrder: z.number().int().min(0),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category | null;
  parentOptions: Array<{ _id: string; name: string }>;
  isLoading?: boolean;
}

const SAMPLE_APPAREL_IMAGES = [
  { label: 'Ethnic Sarees', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80' },
  { label: 'Summer Dresses', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { label: 'Men Shirts', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
  { label: 'Kids Wear', url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80' },
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentOptions,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState<'basic' | 'seo'>('basic');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: '',
      status: 'ACTIVE',
      displayOrder: 0,
      seoTitle: '',
      seoDescription: '',
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setValue('image', event.target.result, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const watchName = watch('name');
  const watchImage = watch('image');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        image: initialData.image || '',
        parentId: initialData.parentId?._id || null,
        status: initialData.status,
        displayOrder: initialData.displayOrder || 0,
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        image: '',
        parentId: null,
        status: 'ACTIVE',
        displayOrder: 0,
        seoTitle: '',
        seoDescription: '',
      });
    }
    setActiveTab('basic');
  }, [initialData, isOpen, reset]);

  const handleGenerateSlug = () => {
    if (watchName) {
      const generated = watchName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setValue('slug', generated, { shouldValidate: true });
    }
  };

  const onFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      parentId: values.parentId || null,
    });
  };

  // Filter out the category itself if editing, so it cannot be selected as its own parent
  const filteredParents = parentOptions.filter((p) => !initialData || p._id !== initialData._id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Category: ${initialData.name}` : 'Create New Category'}
      description="Manage catalog categories, hierarchical parent levels, and SEO parameters."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onFormSubmit)}
            isLoading={isLoading}
          >
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Sub-tab navigation */}
        <div className="flex border-b border-cream-400 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-coffee-700 text-coffee-900'
                : 'border-transparent text-coffee-600 hover:text-coffee-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Basic Information & Media</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'seo'
                ? 'border-coffee-700 text-coffee-900'
                : 'border-transparent text-coffee-600 hover:text-coffee-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO & Description</span>
          </button>
        </div>

        {activeTab === 'basic' && (
          <div className="space-y-4 pt-1">
            {/* Name & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Input
                label="Category Name *"
                placeholder="e.g. Maxi Dresses"
                {...register('name')}
                error={errors.name?.message}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-coffee-900">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate</span>
                  </button>
                </div>
                <input
                  {...register('slug')}
                  placeholder="e.g. maxi-dresses"
                  className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-sm text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm"
                />
                {errors.slug && <p className="text-xs text-rose-700 mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            {/* Parent Category & Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-coffee-900 mb-1.5">
                  Parent Category (Hierarchy)
                </label>
                <select
                  {...register('parentId')}
                  className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-sm text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm cursor-pointer"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {filteredParents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-coffee-600 mt-1">
                  Leave as None to create a main departmental category (e.g. Women, Men, Kids).
                </p>
              </div>

              <div>
                <Input
                  type="number"
                  label="Display Order"
                  placeholder="0"
                  {...register('displayOrder', { valueAsNumber: true })}
                  error={errors.displayOrder?.message}
                  helperText="Lower numbers appear first"
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="p-3.5 rounded-xl border border-cream-400 bg-cream-100/60 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-coffee-900">
                  Category Status
                </span>
                <span className="text-[11px] text-coffee-600">
                  Inactive categories are hidden from customers on the storefront.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  {...register('status')}
                  className="rounded-lg border border-cream-400 bg-cream-50 px-2.5 py-1.5 text-xs font-semibold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-sm cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Image URL & Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-coffee-900">
                  Category Cover Image
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-coffee-900 hover:text-gold-600 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 border border-cream-300 shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Computer</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <Input
                placeholder="Paste image URL (https://images.unsplash.com/...) or upload from computer"
                leftIcon={<ImageIcon className="w-4 h-4 text-coffee-600" />}
                {...register('image')}
                error={errors.image?.message}
                helperText="Upload a file or paste an image URL or pick from fashion presets below"
              />

              {/* Quick Sample Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-coffee-600 mr-1">Presets:</span>
                {SAMPLE_APPAREL_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setValue('image', preset.url, { shouldValidate: true })}
                    className="text-[10px] font-medium px-2 py-1 rounded-md bg-cream-200 border border-cream-300 text-coffee-800 hover:bg-cream-300 transition-colors shadow-sm"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Preview Box */}
              {watchImage && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl border border-cream-400 bg-cream-100/60 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={watchImage}
                    alt="Category Preview"
                    className="h-16 w-16 rounded-lg object-cover border border-cream-400 shadow-sm"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-coffee-900">Image Preview</p>
                    <p className="text-[10px] text-coffee-600 truncate max-w-xs">{watchImage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4 pt-1">
            <Textarea
              label="Category Description"
              placeholder="Describe this category for buyers and internal merchandising..."
              rows={3}
              {...register('description')}
              error={errors.description?.message}
            />

            <Input
              label="SEO Meta Title"
              placeholder="e.g. Designer Maxi Dresses for Women | Haute Apparel"
              {...register('seoTitle')}
              error={errors.seoTitle?.message}
              helperText="Recommended length: 50-60 characters"
            />

            <Textarea
              label="SEO Meta Description"
              placeholder="e.g. Shop our latest collection of chic, casual and evening dresses. Free shipping on orders over $50."
              rows={3}
              {...register('seoDescription')}
              error={errors.seoDescription?.message}
              helperText="Recommended length: 140-160 characters"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
