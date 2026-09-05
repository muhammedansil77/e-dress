'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData, Color, Size, ProductVariant } from '../../../types/product';
import { Palette, Check, Sparkles, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface StepVariantsProps {
  form: UseFormReturn<ProductFormData>;
  colors: Color[];
  sizes: Size[];
}

export const StepVariants: React.FC<StepVariantsProps> = ({ form, colors, sizes }) => {
  const { setValue, watch } = form;

  const variants = watch('variants') || [];
  const baseSku = watch('sku') || 'DRS-001';
  const basePrice = watch('price') || 0;
  const baseDiscountPrice = watch('discountPrice') || null;

  // Derive initial selected colors and sizes from existing variants in form
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedSizeCodes, setSelectedSizeCodes] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && variants.length > 0 && colors.length > 0 && sizes.length > 0) {
      const activeColorNames = new Set(variants.map((v) => v.color.name));
      const matchedColorIds = colors.filter((c) => activeColorNames.has(c.name)).map((c) => c._id);

      const activeSizeCodes = new Set(variants.map((v) => v.size));
      const matchedSizes = sizes.filter((s) => activeSizeCodes.has(s.code)).map((s) => s.code);

      if (matchedColorIds.length > 0) setSelectedColorIds(matchedColorIds);
      if (matchedSizes.length > 0) setSelectedSizeCodes(matchedSizes);
      setHasInitialized(true);
    }
  }, [variants, colors, sizes, hasInitialized]);

  // Generate or regenerate combinations from current selections
  const generateCombinations = (colorIds: string[], sizeCodes: string[]) => {
    const chosenColors = colors.filter((c) => colorIds.includes(c._id));
    const chosenSizes = sizeCodes;

    if (chosenColors.length === 0 || chosenSizes.length === 0) {
      return;
    }

    const newVariants: ProductVariant[] = [];

    chosenColors.forEach((col) => {
      chosenSizes.forEach((sz) => {
        const colorPrefix = col.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const sku = `${baseSku}-${colorPrefix}-${sz}`;

        // Preserve existing variant data (e.g. customized price or stock) if it exists
        const exists = variants.find((v) => v.color.name === col.name && v.size === sz);
        if (exists) {
          newVariants.push(exists);
        } else {
          newVariants.push({
            sku,
            color: { name: col.name, hexCode: col.hexCode },
            size: sz,
            price: basePrice || undefined,
            discountPrice: baseDiscountPrice || undefined,
            stock: 10,
            status: 'ACTIVE',
          });
        }
      });
    });

    setValue('variants', newVariants, { shouldValidate: true });
  };

  const toggleColor = (colorId: string) => {
    const nextColors = selectedColorIds.includes(colorId)
      ? selectedColorIds.filter((id) => id !== colorId)
      : [...selectedColorIds, colorId];
    setSelectedColorIds(nextColors);
    generateCombinations(nextColors, selectedSizeCodes);
  };

  const toggleSize = (sizeCode: string) => {
    const nextSizes = selectedSizeCodes.includes(sizeCode)
      ? selectedSizeCodes.filter((code) => code !== sizeCode)
      : [...selectedSizeCodes, sizeCode];
    setSelectedSizeCodes(nextSizes);
    generateCombinations(selectedColorIds, nextSizes);
  };

  const handleSelectAllSizes = () => {
    const allCodes = sizes.map((s) => s.code);
    setSelectedSizeCodes(allCodes);
    generateCombinations(selectedColorIds, allCodes);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setValue('variants', updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-coffee-900">Variants Configuration</h3>
        <p className="text-xs text-coffee-600">
          Pick available apparel colors and sizes. Combinations are generated automatically for stock and pricing in the next steps.
        </p>
      </div>

      {/* 1. Pick Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-coffee-900">
            1. Choose Colors ({selectedColorIds.length} of {colors.length} selected)
          </label>
          <span className="text-[11px] text-coffee-600">Click swatch to select/deselect</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {colors.map((c) => {
            const isSelected = selectedColorIds.includes(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => toggleColor(c._id)}
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all shadow-sm',
                  isSelected
                    ? 'border-coffee-700 bg-cream-200 text-coffee-900 ring-2 ring-coffee-700/30'
                    : 'border-cream-400 bg-cream-50 text-coffee-900 hover:border-gold-500'
                )}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                  style={{ backgroundColor: c.hexCode }}
                />
                <span className="truncate flex-1 text-left">{c.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-coffee-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pick Sizes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-coffee-900">
            2. Choose Sizes ({selectedSizeCodes.length} of {sizes.length} selected)
          </label>
          <button
            type="button"
            onClick={handleSelectAllSizes}
            className="text-[11px] font-semibold text-gold-600 hover:underline transition-colors"
          >
            Select All Standard Sizes
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const isSelected = selectedSizeCodes.includes(s.code);
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => toggleSize(s.code)}
                className={cn(
                  'px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm',
                  isSelected
                    ? 'border-coffee-700 bg-coffee-700 text-cream-50'
                    : 'border-cream-400 bg-cream-50 text-coffee-900 hover:bg-cream-200'
                )}
              >
                <span>{s.name}</span>
                {isSelected && <Check className="w-3 h-3 text-cream-50" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status banner */}
      {selectedColorIds.length > 0 && selectedSizeCodes.length > 0 && (
        <div className="p-4 rounded-2xl bg-cream-200/80 border border-cream-400 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="text-xs">
            <span className="font-bold text-coffee-900">
              Active Combinations: {selectedColorIds.length} Colors × {selectedSizeCodes.length} Sizes ={' '}
              {selectedColorIds.length * selectedSizeCodes.length} Generated SKUs
            </span>
            <p className="text-coffee-600 text-[11px] mt-0.5">
              SKUs are ready. You can review individual stock counts in Step 6 (Inventory).
            </p>
          </div>
          <Button
            type="button"
            onClick={() => generateCombinations(selectedColorIds, selectedSizeCodes)}
            variant="outline"
            size="sm"
            className="shrink-0 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            <span>Regenerate SKUs</span>
          </Button>
        </div>
      )}

      {/* Generated Variants Preview */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-coffee-900">
            Generated Variants Matrix ({variants.length})
          </label>
          {variants.length > 0 && (
            <button
              type="button"
              onClick={() => setValue('variants', [], { shouldValidate: true })}
              className="text-[11px] text-rose-700 hover:underline font-semibold"
            >
              Clear All Variants
            </button>
          )}
        </div>

        {variants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {variants.map((v, idx) => (
              <div
                key={v.sku + idx}
                className="flex items-center justify-between p-3 rounded-xl border border-cream-400 bg-cream-50 text-xs shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                    style={{ backgroundColor: v.color.hexCode }}
                  />
                  <div>
                    <div className="font-bold text-coffee-900 flex items-center gap-1.5">
                      <span>{v.color.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-cream-200 border border-cream-300 text-coffee-900 text-[10px] font-bold">
                        {v.size}
                      </span>
                    </div>
                    <span className="font-mono text-coffee-600 text-[10px] block mt-0.5">
                      SKU: {v.sku}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-1 text-coffee-600 hover:text-rose-700 rounded-md transition-colors"
                  title="Remove variant"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed border-cream-400 rounded-2xl bg-cream-100/50">
            <Palette className="w-8 h-8 text-coffee-600/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-coffee-900">
              No variant combinations selected yet
            </p>
            <p className="text-[11px] text-coffee-600 mt-1 max-w-xs mx-auto">
              Select at least 1 color and 1 size above to auto-generate apparel combinations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
