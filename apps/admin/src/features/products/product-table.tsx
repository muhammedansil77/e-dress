'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../../types/product';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import {
  ShoppingBag,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onDelete,
  onToggleStatus,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 p-6 space-y-4 shadow-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-cream-300/80">
            <Skeleton className="h-14 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="w-10 h-10 text-gold-500" />}
        title="No products found"
        description="No apparel items or dresses match your search criteria."
        action={
          <Link href="/catalog/products/new">
            <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-coffee-700 text-cream-50 hover:bg-coffee-800 transition-colors shadow-sm border border-coffee-800">
              Create First Product
            </button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cream-400 bg-cream-200/70 text-[11px] font-bold uppercase tracking-wider text-coffee-700">
              <th className="py-3.5 px-4 w-16">Photo</th>
              <th className="py-3.5 px-4">Product Details</th>
              <th className="py-3.5 px-4">Category & Brand</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Stock & Variants</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-400/60 text-xs">
            {products.map((p) => {
              const coverImg = p.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
              const hasDiscount = p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice > 0;

              return (
                <tr
                  key={p._id}
                  className="hover:bg-cream-100/70 transition-colors group"
                >
                  {/* Photo */}
                  <td className="py-3 px-4">
                    <div className="h-14 w-11 rounded-xl overflow-hidden bg-cream-200 border border-cream-400 shrink-0 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImg}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
                        }}
                      />
                    </div>
                  </td>

                  {/* Name & SKU */}
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-coffee-900 text-sm">
                          {p.name}
                        </span>
                        {p.isFeatured && (
                          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500 shrink-0" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-coffee-600">SKU: {p.sku}</span>
                      {p.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-cream-200 text-coffee-700 border border-cream-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-coffee-900 block">
                      {p.categoryId?.name}
                      {p.subcategoryId && ` > ${p.subcategoryId.name}`}
                    </span>
                    <span className="text-[11px] text-coffee-600">
                      Brand: {p.brandId?.name || 'In-House'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-coffee-900">
                      ${hasDiscount ? p.discountPrice?.toFixed(2) : p.price?.toFixed(2)}
                    </div>
                    {hasDiscount && (
                      <span className="text-[10px] text-coffee-600 line-through">
                        ${p.price?.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Stock & Variants */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-coffee-900">
                      {p.totalStock} units
                    </div>
                    <span className="text-[11px] text-coffee-600">
                      {p.variants?.length || 0} variant(s)
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        p.status === 'ACTIVE'
                          ? 'success'
                          : p.status === 'DRAFT'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onToggleStatus(p)}
                        title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.status === 'ACTIVE'
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-coffee-600 hover:bg-cream-200'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDelete(p)}
                        title="Delete Product"
                        className="p-1.5 rounded-lg text-coffee-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-cream-400 bg-cream-100/60 text-xs text-coffee-600">
        <span>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} dresses
        </span>

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
