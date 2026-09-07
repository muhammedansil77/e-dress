'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../../../services/category.service';
import { Category, CategoryFormData, CategoryStatus } from '../../../../types';
import { CategoryTable } from '../../../../features/categories/category-table';
import { CategoryFormModal } from '../../../../features/categories/category-form-modal';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { useToast } from '../../../../components/ui/toast';
import { FolderTree, Plus, Search, Layers, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

export default function SubcategoriesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query category tree to get parents and their subcategories
  const { data: categoryTree = [], isLoading: loadingTree } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getCategoryTree(),
  });

  // Query all active categories for parent options in modal
  const { data: activeCategories = [] } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoryService.getActiveCategories(),
  });

  // Query paginated categories
  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories', 'subcategories', { page, limit, search: debouncedSearch, parentId: selectedParentId }],
    queryFn: () =>
      categoryService.getCategories({
        page,
        limit,
        search: debouncedSearch || undefined,
        parentId: selectedParentId || undefined,
      }),
  });

  // Filter for only subcategories (where parentId is present or filter by selectedParent)
  const allFetched = categoriesResponse?.data || [];
  const subcategories = selectedParentId
    ? allFetched
    : allFetched.filter((c: Category) => c.parentId !== null && c.parentId !== undefined);
  const meta = categoriesResponse?.meta || { total: subcategories.length, totalPages: 1 };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Subcategory created successfully');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create subcategory');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Subcategory updated successfully');
      setIsModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update subcategory');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CategoryStatus }) =>
      categoryService.updateStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success(`Status updated to ${vars.status}`);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Subcategory deleted successfully');
      setDeleteCandidate(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete subcategory');
    },
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleToggleStatus = (category: Category) => {
    const nextStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: category._id, status: nextStatus });
  };

  // Only root categories (where parentId is null) can be parents for subcategories
  const parentOptions = activeCategories
    .filter((c) => !c.parentId)
    .map((c) => ({ _id: c._id, name: c.name }));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Subcategories Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-700 border border-cream-300">
              Department Child Levels
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Organize apparel product collections under parent departments (e.g. Sarees, Kurtis, Dresses under Women).
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
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Subcategory</span>
          </Button>
        </div>
      </div>

      {/* Department Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-400 shadow-sm">
        {/* Parent Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedParentId('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              selectedParentId === ''
                ? 'bg-coffee-700 text-cream-50 border border-coffee-800'
                : 'bg-cream-200 text-coffee-800 border border-cream-300 hover:bg-cream-300'
            }`}
          >
            All Departments
          </button>
          {parentOptions.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedParentId(p._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                selectedParentId === p._id
                  ? 'bg-coffee-700 text-cream-50 border border-coffee-800'
                  : 'bg-cream-200 text-coffee-800 border border-cream-300 hover:bg-cream-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategory..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-1.5 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all"
          />
        </div>
      </div>

      {/* Subcategory Table */}
      <CategoryTable
        categories={subcategories}
        isLoading={isLoading}
        onEdit={(cat) => {
          setSelectedCategory(cat);
          setIsModalOpen(true);
        }}
        onDelete={(cat) => setDeleteCandidate(cat)}
        onToggleStatus={handleToggleStatus}
        currentPage={page}
        totalPages={meta?.totalPages || 1}
        totalItems={meta?.total || 0}
        pageSize={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setLimit(newSize)}
        onAddCategory={() => setIsModalOpen(true)}
      />

      {/* Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        parentOptions={parentOptions}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => deleteCandidate && deleteMutation.mutate(deleteCandidate._id)}
        title="Delete Subcategory?"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? Products linked to this subcategory will need reassignment.`}
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
