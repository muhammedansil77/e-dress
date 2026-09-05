'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, GetCategoriesParams } from '../../../../services/category.service';
import { Category, CategoryFormData, CategoryStatus } from '../../../../types';
import { CategoryFilterBar } from '../../../../features/categories/category-filter-bar';
import { CategoryTable } from '../../../../features/categories/category-table';
import { CategoryFormModal } from '../../../../features/categories/category-form-modal';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { useToast } from '../../../../components/ui/toast';
import { FolderTree, Sparkles, RefreshCw } from 'lucide-react';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<CategoryStatus | ''>('');
  const [parentId, setParentId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query: Paginated Categories
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['categories', { page, limit, search: debouncedSearch, status, parentId }],
    queryFn: () =>
      categoryService.getCategories({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: (status as CategoryStatus) || undefined,
        parentId: parentId || undefined,
        sortBy: 'displayOrder',
        sortOrder: 'asc',
      }),
  });

  // Query: Active Parent Categories for selection dropdown
  const { data: parentCategories = [] } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoryService.getActiveCategories(),
  });

  // Mutation: Create Category
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Category created successfully!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create category');
    },
  });

  // Mutation: Update Category
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Category updated successfully!');
      setIsModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update category');
    },
  });

  // Mutation: Toggle Category Status
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CategoryStatus }) =>
      categoryService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success(`Category marked as ${variables.status.toLowerCase()}`);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update category status');
    },
  });

  // Mutation: Delete Category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      success('Category deleted successfully');
      setDeleteCandidate(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete category');
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleToggleStatus = (category: Category) => {
    const nextStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: category._id, status: nextStatus });
  };

  const handleConfirmDelete = () => {
    if (deleteCandidate) {
      deleteMutation.mutate(deleteCandidate._id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setParentId('');
    setPage(1);
  };

  const categories = categoriesResponse?.data || [];
  const meta = categoriesResponse?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-coffee-900 tracking-tight">
              Category Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-700 border border-cream-300">
              {meta.total} Total
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Organize dresses, tops, ethnic wear, and departments with unlimited nested categories.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2 rounded-xl border border-cream-400 bg-cream-50 hover:bg-cream-200 text-coffee-600 transition-colors shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <CategoryFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        parentId={parentId}
        onParentChange={(newParent) => {
          setParentId(newParent);
          setPage(1);
        }}
        parentOptions={parentCategories}
        onAddCategory={handleOpenCreate}
        onReset={handleResetFilters}
      />

      {/* Categories Table View */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(cat) => setDeleteCandidate(cat)}
        onToggleStatus={handleToggleStatus}
        onAddCategory={handleOpenCreate}
        currentPage={page}
        totalPages={meta.totalPages || 1}
        totalItems={meta.total || 0}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
      />

      {/* Create / Edit Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        parentOptions={parentCategories}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={
          deleteCandidate
            ? `Are you sure you want to delete '${deleteCandidate.name}'? Subcategories or products assigned to this category must be reassigned first.`
            : 'Are you sure you want to delete this category?'
        }
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
