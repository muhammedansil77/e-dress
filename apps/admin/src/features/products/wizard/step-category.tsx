'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../../../types/product';
import { CategoryTreeItem } from '../../../types';
import { FolderTree, Layers, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StepCategoryProps {
  form: UseFormReturn<ProductFormData>;
  categoryTree: CategoryTreeItem[];
}

export const StepCategory: React.FC<StepCategoryProps> = ({ form, categoryTree }) => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedCategoryId = watch('categoryId');
  const selectedSubcategoryId = watch('subcategoryId');

  // Find active root department
  const selectedRoot = categoryTree.find((c) => c._id === selectedCategoryId);
  const subcategories = selectedRoot?.children || [];

  const handleSelectRoot = (catId: string) => {
    setValue('categoryId', catId, { shouldValidate: true });
    setValue('subcategoryId', null); // Reset subcategory when root changes
  };

  const handleSelectSubcategory = (subId: string) => {
    setValue('subcategoryId', subId, { shouldValidate: true });
  };

  const selectedSub = subcategories.find((s) => s._id === selectedSubcategoryId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-coffee-900">Category & Hierarchy</h3>
        <p className="text-xs text-coffee-600">
          Assign the dress or apparel item to a departmental hierarchy and subcategory.
        </p>
      </div>

      {/* Selected Breadcrumb Preview */}
      {selectedRoot && (
        <div className="p-3.5 rounded-xl bg-cream-200/80 border border-cream-400 flex items-center gap-2 text-xs font-semibold text-coffee-900 shadow-sm">
          <FolderTree className="w-4 h-4 text-gold-500" />
          <span>Hierarchy:</span>
          <span className="font-bold">{selectedRoot.name}</span>
          {selectedSub && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-coffee-600" />
              <span className="font-bold text-gold-600">{selectedSub.name}</span>
            </>
          )}
        </div>
      )}

      {errors.categoryId && (
        <p className="text-xs font-bold text-rose-700">Please select a primary category department.</p>
      )}

      {/* Primary Department Selection Cards */}
      <div>
        <label className="block text-xs font-bold text-coffee-900 mb-2">
          1. Select Department Category *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categoryTree.map((rootCat) => {
            const isSelected = selectedCategoryId === rootCat._id;
            return (
              <button
                key={rootCat._id}
                type="button"
                onClick={() => handleSelectRoot(rootCat._id)}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all relative overflow-hidden group flex items-start justify-between shadow-sm',
                  isSelected
                    ? 'border-coffee-700 bg-cream-200 ring-1 ring-coffee-700'
                    : 'border-cream-400 bg-cream-50 hover:bg-cream-100 hover:border-cream-400'
                )}
              >
                <div>
                  <h4 className="text-sm font-black text-coffee-900">{rootCat.name}</h4>
                  <p className="text-[11px] text-coffee-600 mt-1 line-clamp-2">
                    {rootCat.description || 'Collection department'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-gold-600">
                    {rootCat.children?.length || 0} subcategories
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-coffee-700 text-cream-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Selection */}
      {selectedRoot && (
        <div>
          <label className="block text-xs font-bold text-coffee-900 mb-2">
            2. Select Subcategory under {selectedRoot.name}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {subcategories.map((sub) => {
              const isSelected = selectedSubcategoryId === sub._id;
              return (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => handleSelectSubcategory(sub._id)}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between shadow-sm',
                    isSelected
                      ? 'border-coffee-700 bg-coffee-700 text-cream-50'
                      : 'border-cream-400 bg-cream-50 text-coffee-900 hover:bg-cream-200'
                  )}
                >
                  <span>{sub.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
