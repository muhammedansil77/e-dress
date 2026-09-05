'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterService, CreateSizeDTO } from '../../../../services/master.service';
import { Size } from '../../../../types/product';
import { Modal } from '../../../../components/ui/modal';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { EmptyState } from '../../../../components/ui/empty-state';
import { useToast } from '../../../../components/ui/toast';
import { Ruler, Plus, RefreshCw, Layers } from 'lucide-react';

export default function SizesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sortOrder, setSortOrder] = useState(1);

  const { data: sizes = [], isLoading, refetch } = useQuery({
    queryKey: ['sizes'],
    queryFn: () => masterService.getSizes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSizeDTO) => masterService.createSize(data),
    onSuccess: (newSize) => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
      success(`Size "${newSize.name}" added successfully!`);
      setIsModalOpen(false);
      setName('');
      setCode('');
      setSortOrder(sizes.length + 1);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to add size');
    },
  });

  const handleSaveSize = async () => {
    if (!name.trim() || !code.trim()) {
      toastError('Size name and code are required');
      return;
    }
    await createMutation.mutateAsync({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      sortOrder: Number(sortOrder) || 0,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Apparel Sizes Master
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-800 border border-cream-400">
              Standard Fashion Sizes
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Configure standard fashion garment size scales available for dresses, kurtis, and tops.
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
              setName('');
              setCode('');
              setSortOrder(sizes.length + 1);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Size</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && sizes.length === 0 && (
        <EmptyState
          icon={<Ruler className="w-10 h-10 text-gold-500" />}
          title="No sizes configured"
          description="Create your first garment size for apparel variants."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setName('');
                setCode('');
                setSortOrder(1);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Size</span>
            </Button>
          }
        />
      )}

      {/* Sizes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {sizes.map((s) => (
          <div
            key={s._id}
            className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex flex-col items-center justify-center text-center space-y-2 hover:border-gold-500 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-cream-200 text-coffee-800 font-black text-lg flex items-center justify-center border border-cream-400">
              {s.code}
            </div>
            <div>
              <h3 className="font-bold text-coffee-900 text-xs">{s.name}</h3>
              <p className="text-[10px] text-coffee-600 mt-0.5">Order: #{s.sortOrder}</p>
            </div>
            <Badge variant="success" size="sm">
              ACTIVE
            </Badge>
          </div>
        ))}
      </div>

      {/* Add Size Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Garment Size"
        description="Add a size option that will be available when creating apparel product variants."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveSize}
              isLoading={createMutation.isPending}
            >
              Add Size
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Size Code *"
            placeholder="e.g. 4XL, 28, 30, Free Size"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (!name) setName(e.target.value.toUpperCase());
            }}
          />

          <Input
            label="Size Label / Name *"
            placeholder="e.g. 4X-Large, Waist 28, Free Size"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="number"
            label="Sort Order"
            placeholder="e.g. 8"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
            helperText="Lower numbers appear first in the customer storefront size selector"
          />
        </div>
      </Modal>
    </div>
  );
}
