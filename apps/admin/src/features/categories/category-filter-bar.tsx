'use client';

import React from 'react';
import { Search, Plus, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CategoryStatus } from '../../types';

interface CategoryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: CategoryStatus | '';
  onStatusChange: (status: CategoryStatus | '') => void;
  parentId?: string;
  onParentChange: (parentId: string) => void;
  parentOptions: Array<{ _id: string; name: string }>;
  onAddCategory: () => void;
  onReset: () => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  parentId,
  onParentChange,
  parentOptions,
  onAddCategory,
  onReset,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-400 shadow-sm">
      {/* Search & Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search category name, slug or description..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-2 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[130px]">
          <select
            value={status || ''}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 cursor-pointer transition-all"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Parent Filter */}
        <div className="min-w-[160px]">
          <select
            value={parentId || ''}
            onChange={(e) => onParentChange(e.target.value)}
            className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 cursor-pointer transition-all"
          >
            <option value="">All Categories</option>
            <option value="null">Top-Level (Root) Only</option>
            {parentOptions.map((parent) => (
              <option key={parent._id} value={parent._id}>
                Under: {parent.name}
              </option>
            ))}
          </select>
        </div>

        {(search || status || parentId) && (
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2 rounded-xl text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 transition-colors text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <Button
        onClick={onAddCategory}
        variant="primary"
        size="md"
        className="shrink-0 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add Category</span>
      </Button>
    </div>
  );
};
