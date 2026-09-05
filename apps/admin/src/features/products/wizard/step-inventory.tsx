'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../../../types/product';
import { Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StepInventoryProps {
  form: UseFormReturn<ProductFormData>;
}

export const StepInventory: React.FC<StepInventoryProps> = ({ form }) => {
  const { register, watch, setValue } = form;

  const variants = watch('variants') || [];
  const basePrice = watch('price') || 0;

  const totalCalculatedStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  const handleUpdateVariantField = (index: number, field: string, val: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = val;
    setValue('variants', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-coffee-900">Inventory & SKU Matrix</h3>
          <p className="text-xs text-coffee-600">
            Set individual stock counts, custom SKU codes, and optional price overrides per variant.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream-200 border border-cream-400 text-xs font-bold text-coffee-900 shadow-sm">
          <Boxes className="w-4 h-4 text-gold-500" />
          <span>Total Combined Stock: {totalCalculatedStock} units</span>
        </div>
      </div>

      {variants.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-cream-400 bg-cream-50 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cream-400 bg-cream-200/70 text-[11px] font-bold uppercase tracking-wider text-coffee-700">
                <th className="py-3 px-4">Variant</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Price ($)</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-400/60">
              {variants.map((v, idx) => (
                <tr key={v.sku + idx} className="hover:bg-cream-100/70 transition-colors">
                  {/* Variant Color */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                        style={{ backgroundColor: v.color.hexCode }}
                      />
                      <span className="font-semibold text-coffee-900">
                        {v.color.name}
                      </span>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-cream-200 border border-cream-300 text-coffee-900">
                      {v.size}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value.toUpperCase())}
                      className="w-32 uppercase rounded-lg border border-cream-400 bg-cream-100 px-2.5 py-1 text-xs font-mono font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                    />
                  </td>

                  {/* Price override */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price ?? basePrice}
                      onChange={(e) =>
                        handleUpdateVariantField(idx, 'price', parseFloat(e.target.value) || basePrice)
                      }
                      className="w-24 rounded-lg border border-cream-400 bg-cream-100 px-2.5 py-1 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                    />
                  </td>

                  {/* Stock count */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        handleUpdateVariantField(idx, 'stock', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-20 rounded-lg border border-cream-400 bg-cream-100 px-2.5 py-1 text-xs font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                    />
                  </td>

                  {/* Stock status indicator */}
                  <td className="py-3 px-4 text-center">
                    {v.stock > 5 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </span>
                    ) : v.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-cream-400 rounded-2xl bg-cream-100/50">
          <Boxes className="w-8 h-8 text-coffee-600/70 mx-auto mb-2" />
          <p className="text-xs font-bold text-coffee-900">
            No variants configured
          </p>
          <p className="text-[11px] text-coffee-600 mt-1 max-w-sm mx-auto">
            You can return to Step 4 (Variants) to generate Color and Size combinations, or publish this item with standard single inventory.
          </p>
        </div>
      )}
    </div>
  );
};
