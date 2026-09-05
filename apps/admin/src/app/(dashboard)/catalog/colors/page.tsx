'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterService, CreateColorDTO } from '../../../../services/master.service';
import { Color } from '../../../../types/product';
import { Modal } from '../../../../components/ui/modal';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { EmptyState } from '../../../../components/ui/empty-state';
import { useToast } from '../../../../components/ui/toast';
import { Palette, Plus, RefreshCw } from 'lucide-react';

const PRESET_FASHION_COLORS = [
  { name: 'Royal Gold', hexCode: '#B58B45' },
  { name: 'Espresso Brown', hexCode: '#5A3E2B' },
  { name: 'Ivory Cream', hexCode: '#F7F1E7' },
  { name: 'Emerald Jade', hexCode: '#0f766e' },
  { name: 'Blush Rose', hexCode: '#fb923c' },
  { name: 'Charcoal Noir', hexCode: '#2F241D' },
];

export default function ColorsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#B58B45');

  const { data: colors = [], isLoading, refetch } = useQuery({
    queryKey: ['colors'],
    queryFn: () => masterService.getColors(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateColorDTO) => masterService.createColor(data),
    onSuccess: (newColor) => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      success(`Color "${newColor.name}" added successfully!`);
      setIsModalOpen(false);
      setName('');
      setHexCode('#B58B45');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to add color');
    },
  });

  const handleSaveColor = async () => {
    if (!name.trim() || !hexCode.trim()) {
      toastError('Color name and hex code are required');
      return;
    }
    await createMutation.mutateAsync({
      name: name.trim(),
      hexCode: hexCode.trim(),
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Apparel Colors Master
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-800 border border-cream-400">
              Color Palette
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Maintain apparel dress color swatches and hexadecimal shade codes for variant generators.
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
              setHexCode('#B58B45');
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Color Swatch</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && colors.length === 0 && (
        <EmptyState
          icon={<Palette className="w-10 h-10 text-gold-500" />}
          title="No colors configured"
          description="Create your first color shade swatch for apparel variants."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setName('');
                setHexCode('#B58B45');
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Color Swatch</span>
            </Button>
          }
        />
      )}

      {/* Colors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {colors.map((c) => (
          <div
            key={c._id}
            className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex flex-col items-center text-center space-y-3 hover:border-gold-500 hover:shadow-md transition-all"
          >
            {/* Color Swatch Circle */}
            <div
              className="w-14 h-14 rounded-2xl shadow-inner border border-cream-400/80 flex items-center justify-center transition-transform hover:scale-105"
              style={{ backgroundColor: c.hexCode }}
            />
            <div>
              <h3 className="font-bold text-coffee-900 text-xs">{c.name}</h3>
              <p className="font-mono text-[10px] text-coffee-600 uppercase mt-0.5">{c.hexCode}</p>
            </div>
            <Badge variant="success" size="sm">
              ACTIVE
            </Badge>
          </div>
        ))}
      </div>

      {/* Add Color Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Apparel Color Swatch"
        description="Add a new color shade to use when creating multi-variant dresses."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveColor}
              isLoading={createMutation.isPending}
            >
              Add Color
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-coffee-800 mb-2">
              Color Palette Picker
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="w-14 h-12 rounded-xl cursor-pointer border border-cream-400 bg-transparent p-1"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  placeholder="#B58B45"
                  className="w-full uppercase font-mono rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-xs font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          <Input
            label="Color Shade Name *"
            placeholder="e.g. Royal Indigo, Emerald Green, Peach Rose"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-coffee-600 block mb-1.5">
              Or pick from fashion trending swatches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_FASHION_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setHexCode(preset.hexCode);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-cream-400 bg-cream-100 hover:border-gold-500 text-coffee-800 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-cream-400/80"
                    style={{ backgroundColor: preset.hexCode }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
