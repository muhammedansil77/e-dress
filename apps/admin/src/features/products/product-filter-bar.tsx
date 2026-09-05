'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ProductStatus, Brand } from '../../types/product';
import { CategoryTreeItem } from '../../types';

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: ProductStatus | '';
  onStatusChange: (val: ProductStatus | '') => void;
  categoryId: string;
  onCategoryChange: (val: string) => void;
  brandId: string;
  onBrandChange: (val: string) => void;
  categories: CategoryTreeItem[];
  brands: Brand[];
  onReset: () => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  brandId,
  onBrandChange,
  categories,
  brands,
  onReset,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-400 shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dress title, SKU, or tags..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-2 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 cursor-pointer transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={brandId}
          onChange={(e) => onBrandChange(e.target.value)}
          className="rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 cursor-pointer transition-all"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 cursor-pointer transition-all"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {(search || status || categoryId || brandId) && (
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2 rounded-xl text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 text-xs flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      <Link href="/catalog/products/new">
        <Button variant="primary" size="md" className="shrink-0 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </Link>
    </div>
  );
};
