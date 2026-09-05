'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../../services/product.service';
import { Product, ProductVariant } from '../../../../types/product';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { EmptyState } from '../../../../components/ui/empty-state';
import { Layers, Search, Filter, RefreshCw, ShoppingBag, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function VariantsPage() {
  const [search, setSearch] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const { data: productsResponse, isLoading, refetch } = useQuery({
    queryKey: ['products', 'variants-all'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const products: Product[] = productsResponse?.data || [];

  // Flatten all variants with their parent product information
  const allVariants: Array<{
    variant: ProductVariant;
    product: Product;
  }> = [];

  products.forEach((p) => {
    (p.variants || []).forEach((v) => {
      allVariants.push({ variant: v, product: p });
    });
  });

  // Filter variants
  const filtered = allVariants.filter(({ variant, product }) => {
    if (search) {
      const q = search.toLowerCase();
      const matchSku = variant.sku.toLowerCase().includes(q);
      const matchProd = product.name.toLowerCase().includes(q);
      const matchColor = variant.color.name.toLowerCase().includes(q);
      if (!matchSku && !matchProd && !matchColor) return false;
    }
    if (selectedSize && variant.size !== selectedSize) return false;
    if (selectedColor && variant.color.name !== selectedColor) return false;
    return true;
  });

  // Collect available unique sizes and colors for filter dropdowns
  const availableSizes = Array.from(new Set(allVariants.map((item) => item.variant.size)));
  const availableColors = Array.from(new Set(allVariants.map((item) => item.variant.color.name)));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Product Variants Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-800 border border-cream-400">
              {filtered.length} Active SKUs
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Global matrix of all color and size apparel combinations generated across your catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-cream-400 bg-cream-50 text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 transition-colors shadow-sm"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/catalog/products/new">
            <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-coffee-700 text-cream-50 hover:bg-coffee-800 transition-colors shadow-md shadow-coffee-700/20">
              + New Product
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-400 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by variant SKU, dress title, or color..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-2 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Size Filter */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            <option value="">All Sizes</option>
            {availableSizes.map((sz) => (
              <option key={sz} value={sz}>
                Size: {sz}
              </option>
            ))}
          </select>

          {/* Color Filter */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            <option value="">All Colors</option>
            {availableColors.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          {(search || selectedSize || selectedColor) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSize('');
                setSelectedColor('');
              }}
              className="text-xs text-gold-600 hover:text-gold-500 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Variants Table */}
      {isLoading ? (
        <div className="bg-cream-50 rounded-2xl border border-cream-400 p-6 space-y-4 shadow-sm">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-10 h-10 text-gold-500" />}
          title="No variants found"
          description="Try modifying your filters or create a product with multiple variants."
        />
      ) : (
        <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cream-400 bg-cream-200/60 text-[11px] font-bold uppercase tracking-wider text-coffee-800">
                  <th className="py-3 px-4">Variant SKU</th>
                  <th className="py-3 px-4">Parent Product</th>
                  <th className="py-3 px-4">Color Shade</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-400/60">
                {filtered.map(({ variant, product }, idx) => (
                  <tr
                    key={variant.sku + idx}
                    className="hover:bg-cream-100/70 transition-colors"
                  >
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-bold text-coffee-900">
                      {variant.sku}
                    </td>

                    {/* Parent Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {product.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-8 h-10 rounded-lg object-cover border border-cream-400 bg-cream-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-10 rounded-lg bg-cream-200 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-coffee-900 block truncate max-w-xs">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-coffee-600">
                            Base: {product.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Color */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-cream-400/80 shrink-0"
                          style={{ backgroundColor: variant.color.hexCode }}
                        />
                        <span className="font-medium text-coffee-900">
                          {variant.color.name}
                        </span>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded-md bg-cream-200 text-coffee-800 border border-cream-400">
                        {variant.size}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-coffee-900">
                      ${(variant.discountPrice || variant.price || product.price).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-coffee-900">
                          {variant.stock}
                        </span>
                        <span className="text-[10px] text-coffee-600">units</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={variant.status === 'ACTIVE' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {variant.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
