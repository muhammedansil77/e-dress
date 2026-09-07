'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService, CreateBrandDTO } from '../../../../services/brand.service';
import { Brand } from '../../../../types/product';
import { Modal } from '../../../../components/ui/modal';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { EmptyState } from '../../../../components/ui/empty-state';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { useToast } from '../../../../components/ui/toast';
import {
  Tag,
  Plus,
  Search,
  Globe,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Brand | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query Brands
  const {
    data: brandsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['brands', { search: debouncedSearch, status: statusFilter }],
    queryFn: () =>
      brandService.getBrands({
        search: debouncedSearch || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  const brands = brandsResponse?.data || [];

  // Open modal in create mode
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormName('');
    setFormSlug('');
    setFormLogo('');
    setFormDescription('');
    setFormWebsite('');
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setFormName(b.name);
    setFormSlug(b.slug);
    setFormLogo(b.logo || '');
    setFormDescription(b.description || '');
    setFormWebsite((b as any).website || '');
    setFormStatus((b as any).status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (formName) {
      const generated = formName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setFormSlug(generated);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setFormLogo(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateBrandDTO) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      success('Brand created successfully!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create brand');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBrandDTO> }) =>
      brandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      success('Brand updated successfully!');
      setIsModalOpen(false);
      setEditingBrand(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update brand');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      success('Brand deleted successfully!');
      setDeleteCandidate(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete brand');
    },
  });

  const handleSaveBrand = async () => {
    if (!formName.trim()) {
      toastError('Brand name is required');
      return;
    }

    const payload: CreateBrandDTO = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      logo: formLogo.trim() || undefined,
      description: formDescription.trim() || undefined,
      website: formWebsite.trim() || undefined,
      status: formStatus,
    };

    if (editingBrand) {
      await updateMutation.mutateAsync({ id: editingBrand._id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleToggleStatus = (b: Brand) => {
    const nextStatus = (b as any).status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMutation.mutate({ id: b._id, data: { status: nextStatus } });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Brands & Designers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-800 border border-cream-400">
              Catalog Master
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Manage fashion labels, brands, and designers featured across your dresses and apparel collections.
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
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Brand</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-400 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by name..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-2 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-coffee-700 text-cream-50 shadow-md shadow-coffee-700/20'
                  : 'bg-cream-200 text-coffee-700 hover:bg-cream-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-cream-400 bg-cream-50 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && brands.length === 0 && (
        <EmptyState
          icon={<Tag className="w-10 h-10 text-gold-500" />}
          title="No brands found"
          description="Create your first apparel brand or reset your search filter."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Brand</span>
            </Button>
          }
        />
      )}

      {/* Brands Grid */}
      {!isLoading && brands.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => {
            const isActive = (b as any).status !== 'INACTIVE';
            return (
              <div
                key={b._id}
                className="group relative p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {b.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="w-10 h-10 rounded-xl object-cover border border-cream-400 bg-cream-100"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-cream-200 text-coffee-800 font-black text-sm flex items-center justify-center border border-cream-400">
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-coffee-900 text-sm">
                          {b.name}
                        </h3>
                        <p className="font-mono text-[11px] text-coffee-600">/{b.slug}</p>
                      </div>
                    </div>

                    <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>

                  <p className="text-xs text-coffee-600 line-clamp-2">
                    {b.description || 'No description provided.'}
                  </p>

                  {(b as any).website && (
                    <a
                      href={(b as any).website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-gold-600 hover:text-gold-500 hover:underline mt-2 font-medium"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-cream-400/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className="text-[11px] font-semibold text-coffee-600 hover:text-coffee-900"
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(b)}
                      className="p-1.5 rounded-lg text-coffee-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Brand Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand'}
        description="Register an apparel designer or fashion manufacturer to tag on dresses."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveBrand}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBrand ? 'Save Changes' : 'Create Brand'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Brand Name *"
            placeholder="e.g. Allen Solly, Biba, Zara"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (!formSlug) {
                setFormSlug(
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                );
              }
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-coffee-800">
                URL Slug
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-[11px] text-gold-600 hover:text-gold-500 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-generate</span>
              </button>
            </div>
            <input
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="e.g. allen-solly"
              className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-coffee-800">
                Brand Logo
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-gold-600 hover:text-gold-500 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Logo File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <Input
              placeholder="Paste logo URL (https://...) or upload from computer"
              value={formLogo}
              onChange={(e) => setFormLogo(e.target.value)}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />
            {formLogo && (
              <div className="mt-2 flex items-center gap-2.5 p-2 rounded-xl border border-cream-400 bg-cream-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formLogo} alt="Preview" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-[11px] text-coffee-600 truncate max-w-xs">{formLogo}</span>
              </div>
            )}
          </div>

          <Input
            label="Official Website (Optional)"
            placeholder="https://www.allensolly.com"
            value={formWebsite}
            onChange={(e) => setFormWebsite(e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
          />

          <Textarea
            label="Brand Description"
            placeholder="Describe this brand's aesthetic, legacy, or materials..."
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-coffee-800 mb-1.5">
              Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => deleteCandidate && deleteMutation.mutate(deleteCandidate._id)}
        title="Delete Brand?"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? Products currently assigned to this brand will remain but become unbranded.`}
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
