'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../../../services/product.service';
import { Product, ProductVariant } from '../../../../types/product';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { EmptyState } from '../../../../components/ui/empty-state';
import { useToast } from '../../../../components/ui/toast';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Save,
  Plus,
  Minus,
  TrendingDown,
  Package,
} from 'lucide-react';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  const { data: productsResponse, isLoading, refetch } = useQuery({
    queryKey: ['products', 'inventory-all'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const products: Product[] = productsResponse?.data || [];

  // Flatten all variants with their parent product
  const allInventoryItems: Array<{
    variant: ProductVariant;
    product: Product;
    uniqueKey: string;
  }> = [];

  products.forEach((p) => {
    (p.variants || []).forEach((v) => {
      allInventoryItems.push({
        variant: v,
        product: p,
        uniqueKey: `${p._id}_${v.sku}`,
      });
    });
  });

  // Calculate KPIs
  const totalStockCount = allInventoryItems.reduce((acc, item) => acc + (item.variant.stock || 0), 0);
  const lowStockCount = allInventoryItems.filter(
    (item) => item.variant.stock > 0 && item.variant.stock <= 10
  ).length;
  const outOfStockCount = allInventoryItems.filter((item) => (item.variant.stock || 0) === 0).length;

  // Filter items
  const filtered = allInventoryItems.filter(({ variant, product }) => {
    const q = search.toLowerCase();
    if (q) {
      const matchSku = variant.sku.toLowerCase().includes(q);
      const matchName = product.name.toLowerCase().includes(q);
      const matchColor = variant.color.name.toLowerCase().includes(q);
      if (!matchSku && !matchName && !matchColor) return false;
    }

    const currentVal =
      editingStock[`${product._id}_${variant.sku}`] !== undefined
        ? editingStock[`${product._id}_${variant.sku}`]
        : variant.stock;

    if (stockFilter === 'LOW') return currentVal > 0 && currentVal <= 10;
    if (stockFilter === 'OUT') return currentVal === 0;
    return true;
  });

  // Mutation to update stock in a product's variants
  const updateStockMutation = useMutation({
    mutationFn: async ({
      product,
      variantSku,
      newStock,
    }: {
      product: Product;
      variantSku: string;
      newStock: number;
    }) => {
      const updatedVariants = (product.variants || []).map((v) =>
        v.sku === variantSku ? { ...v, stock: newStock } : v
      );
      return productService.updateProduct(product._id, {
        variants: updatedVariants,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success(`Stock for ${vars.variantSku} updated to ${vars.newStock} units!`);
      const key = `${vars.product._id}_${vars.variantSku}`;
      const newEditing = { ...editingStock };
      delete newEditing[key];
      setEditingStock(newEditing);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update stock');
    },
  });

  const handleStockChange = (key: string, val: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const handleSaveItemStock = (item: { product: Product; variant: ProductVariant; uniqueKey: string }) => {
    const newStock = editingStock[item.uniqueKey];
    if (newStock === undefined) return;
    updateStockMutation.mutate({
      product: item.product,
      variantSku: item.variant.sku,
      newStock,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
              Inventory & Stock Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-coffee-800 border border-cream-400">
              Real-time Warehouse
            </span>
          </div>
          <p className="text-xs text-coffee-600 mt-1">
            Monitor available dress inventory, track low-stock thresholds, and adjust variant quantities in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-cream-400 bg-cream-50 text-coffee-600 hover:text-coffee-900 hover:bg-cream-200 transition-colors shadow-sm"
            title="Refresh Stock"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cream-200 text-coffee-800 flex items-center justify-center border border-cream-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600">
              Total In-Stock Units
            </span>
            <p className="text-2xl font-black text-coffee-900">{totalStockCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600">
              Low Stock Variants
            </span>
            <p className="text-2xl font-black text-amber-700">{lowStockCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600">
              Out of Stock SKUs
            </span>
            <p className="text-2xl font-black text-rose-700">{outOfStockCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-cream-400 bg-cream-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cream-200 text-gold-600 flex items-center justify-center border border-cream-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600">
              Active Variant SKUs
            </span>
            <p className="text-2xl font-black text-coffee-900">{allInventoryItems.length}</p>
          </div>
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
            placeholder="Search variant SKU or dress name..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-2 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'LOW', 'OUT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStockFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === mode
                  ? 'bg-coffee-700 text-cream-50 shadow-md shadow-coffee-700/20'
                  : 'bg-cream-200 text-coffee-700 hover:bg-cream-300'
              }`}
            >
              {mode === 'ALL' ? 'All Stock' : mode === 'LOW' ? 'Low Stock (≤10)' : 'Out of Stock (0)'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="bg-cream-50 rounded-2xl border border-cream-400 p-6 space-y-4 shadow-sm">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-10 h-10 text-gold-500" />}
          title="No inventory records found"
          description="Try resetting your search or stock filter."
        />
      ) : (
        <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cream-400 bg-cream-200/60 text-[11px] font-bold uppercase tracking-wider text-coffee-800">
                  <th className="py-3 px-4">Variant SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Quantity Adjustment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-400/60">
                {filtered.map((item) => {
                  const { variant, product, uniqueKey } = item;
                  const currentStock =
                    editingStock[uniqueKey] !== undefined ? editingStock[uniqueKey] : variant.stock;
                  const isModified =
                    editingStock[uniqueKey] !== undefined && editingStock[uniqueKey] !== variant.stock;

                  return (
                    <tr
                      key={uniqueKey}
                      className="hover:bg-cream-100/70 transition-colors"
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-bold text-coffee-900">
                        {variant.sku}
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {product.images?.[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-8 h-10 rounded-lg object-cover border border-cream-400 bg-cream-100 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-10 rounded-lg bg-cream-200 shrink-0" />
                          )}
                          <span className="font-semibold text-coffee-900 truncate max-w-xs block">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      {/* Color */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-cream-400/80 shrink-0"
                            style={{ backgroundColor: variant.color.hexCode }}
                          />
                          <span className="font-medium text-coffee-900">
                            {variant.color.name}
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4">
                        <span className="font-bold px-2 py-0.5 rounded-md bg-cream-200 text-coffee-800 border border-cream-400">
                          {variant.size}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4">
                        {currentStock > 10 ? (
                          <Badge variant="success" size="sm">
                            In Stock ({currentStock})
                          </Badge>
                        ) : currentStock > 0 ? (
                          <Badge variant="warning" size="sm">
                            Low Stock ({currentStock})
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm">
                            Out of Stock
                          </Badge>
                        )}
                      </td>

                      {/* Quick Quantity Controls */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockChange(uniqueKey, currentStock - 1)}
                            className="p-1 rounded-lg border border-cream-400 bg-cream-100 hover:bg-cream-200 text-coffee-700 transition-colors"
                            title="Decrease Stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={currentStock}
                            onChange={(e) =>
                              handleStockChange(uniqueKey, parseInt(e.target.value) || 0)
                            }
                            className="w-16 rounded-lg border border-cream-400 bg-cream-50 px-2 py-1 text-xs text-center font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(uniqueKey, currentStock + 1)}
                            className="p-1 rounded-lg border border-cream-400 bg-cream-100 hover:bg-cream-200 text-coffee-700 transition-colors"
                            title="Increase Stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Save Action */}
                      <td className="py-3 px-4 text-right">
                        {isModified ? (
                          <button
                            onClick={() => handleSaveItemStock(item)}
                            disabled={updateStockMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-coffee-700 hover:bg-coffee-800 text-cream-50 text-[11px] font-bold shadow transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-coffee-600/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
