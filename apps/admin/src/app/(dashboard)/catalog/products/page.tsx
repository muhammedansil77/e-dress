'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Product, ProductStatus } from '@/types/product';
import { ProductFilterBar } from '@/features/products/product-filter-bar';
import { ProductTable } from '@/features/products/product-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { RefreshCw } from 'lucide-react';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Queries
  const {
    data: productsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products', { page, limit, search: debouncedSearch, status, categoryId, brandId }],
    queryFn: () =>
      productService.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: (status as ProductStatus) || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
      }),
  });

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getCategoryTree(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => productService.getBrands(),
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      productService.updateStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success(`Product status updated to ${vars.status}`);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Product deleted successfully');
      setDeleteCandidate(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleToggleStatus = (p: Product) => {
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: p._id, status: nextStatus });
  };

  const handleConfirmDelete = () => {
    if (deleteCandidate) {
      deleteMutation.mutate(deleteCandidate._id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCategoryId('');
    setBrandId('');
    setPage(1);
  };

  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Product & Dress Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-700 border border-cream-300">
              {meta.total} Total
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Manage luxury dresses, gowns, tops, kurtis, inventory variants, SKU matrices, and promotional pricing.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2 rounded-xl border border-cream-400 bg-cream-50 hover:bg-cream-200 text-coffee-600 transition-colors shadow-sm"
          title="Refresh Catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(cat) => {
          setCategoryId(cat);
          setPage(1);
        }}
        brandId={brandId}
        onBrandChange={(b) => {
          setBrandId(b);
          setPage(1);
        }}
        categories={categoryTree}
        brands={brands}
        onReset={handleResetFilters}
      />

      {/* Products Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onDelete={(p) => setDeleteCandidate(p)}
        onToggleStatus={handleToggleStatus}
        currentPage={page}
        totalPages={meta.totalPages || 1}
        totalItems={meta.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={
          deleteCandidate
            ? `Are you sure you want to delete '${deleteCandidate.name}'? This will remove its SKU variants and archive it from the customer storefront.`
            : 'Are you sure you want to delete this product?'
        }
        confirmText="Delete Product"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
