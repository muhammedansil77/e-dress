'use client';

import React from 'react';
import { Category, CategoryStatus } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onAddCategory: () => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddCategory,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-cream-300/80">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<FolderTree className="w-10 h-10 text-gold-500" />}
        title="No categories found"
        description="No clothing or apparel categories match your current search and filters."
        action={
          <button
            onClick={onAddCategory}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-coffee-700 text-cream-50 hover:bg-coffee-800 transition-colors shadow-sm border border-coffee-800"
          >
            Create Your First Category
          </button>
        }
      />
    );
  }

  return (
    <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 shadow-sm overflow-hidden flex flex-col">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cream-400 bg-cream-200/70 text-[11px] font-bold uppercase tracking-wider text-coffee-700">
              <th className="py-3.5 px-4 w-16">Image</th>
              <th className="py-3.5 px-4">Name & Slug</th>
              <th className="py-3.5 px-4">Parent Category</th>
              <th className="py-3.5 px-4">Products</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Order</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-400/60 text-xs">
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className="hover:bg-cream-100/70 transition-colors group"
              >
                {/* Image */}
                <td className="py-3 px-4">
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-cream-200 border border-cream-400 shrink-0 flex items-center justify-center shadow-sm">
                    {cat.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
                        }}
                      />
                    ) : (
                      <FolderTree className="w-5 h-5 text-coffee-600" />
                    )}
                  </div>
                </td>

                {/* Name & Slug */}
                <td className="py-3 px-4">
                  <div>
                    <span className="font-bold text-coffee-900 text-sm block">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[11px] text-coffee-600">/{cat.slug}</span>
                    {cat.description && (
                      <p className="text-[11px] text-coffee-600 line-clamp-1 max-w-xs mt-0.5">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Parent */}
                <td className="py-3 px-4">
                  {cat.parentId ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 border border-cream-300 text-coffee-800 font-medium text-[11px]">
                      <span className="text-coffee-600">↳</span> {cat.parentId.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gold-500/15 border border-gold-500/30 text-gold-700 font-semibold text-[10px] uppercase tracking-wider">
                      Root Dept
                    </span>
                  )}
                </td>

                {/* Products Count Placeholder */}
                <td className="py-3 px-4">
                  <span className="text-coffee-600 font-medium">
                    0 products
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                    {cat.status}
                  </Badge>
                </td>

                {/* Display Order */}
                <td className="py-3 px-4 text-center font-mono font-semibold text-coffee-600">
                  {cat.displayOrder ?? 0}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    {/* Status quick toggle */}
                    <button
                      onClick={() => onToggleStatus(cat)}
                      title={cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        cat.status === 'ACTIVE'
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-coffee-600 hover:bg-cream-200'
                      }`}
                    >
                      {cat.status === 'ACTIVE' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(cat)}
                      title="Edit Category"
                      className="p-1.5 rounded-lg text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(cat)}
                      title="Delete Category"
                      className="p-1.5 rounded-lg text-coffee-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-cream-400 bg-cream-100/60 text-xs text-coffee-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-cream-400 bg-cream-50 px-2 py-1 text-xs text-coffee-900 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2 font-medium">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} categories
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-cream-400 bg-cream-50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-200 text-coffee-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-coffee-900">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-cream-400 bg-cream-50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-200 text-coffee-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
