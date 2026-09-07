'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { ProductCard } from '../../components/products/product-card';
import { FilterSidebar } from '../../components/products/filter-sidebar';
import { VirtualFittingRoomModal } from '../../components/fitting-room/virtual-fitting-room-modal';
import { bodyProfileService } from '../../services/body-profile.service';
import { Product } from '../../types';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Search,
  Sparkles,
  Ruler,
} from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Virtual Fitting Room State
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false);
  const [fittingRoomProduct, setFittingRoomProduct] = useState<Product | null>(null);
  const [bodyProfile, setBodyProfile] = useState(bodyProfileService.getProfile());

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);

    const handleProfileUpdate = () => {
      setBodyProfile(bodyProfileService.getProfile());
    };
    window.addEventListener('body-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('body-profile-updated', handleProfileUpdate);
  }, [searchParams]);

  // Query Products
  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: [
      'products',
      'shop',
      {
        search,
        sizes: selectedSizes.join(','),
        colors: selectedColors.join(','),
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      },
    ],
    queryFn: () =>
      productService.getProducts({
        search: search || undefined,
        sizes: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
        colors: selectedColors.length > 0 ? selectedColors.join(',') : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        sortOrder,
        limit: 20,
      }),
  });

  // Query Filter Facets
  const { data: facets } = useQuery({
    queryKey: ['facets'],
    queryFn: () => productService.getFilterFacets(),
  });

  const products = productsData?.products || [];

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleClearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Page Header */}
      <div className="border-b border-[#DED2C2] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
            Haute Atelier Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F241D]">
            The Complete Dress Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#806F61] mt-1">
            Browse contemporary silhouettes, georgette maxis, festive kurtis, and designer sets.
          </p>
        </div>

        {/* Sort & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-lg border border-[#DED2C2] bg-[#FFFDF8] text-xs font-semibold text-[#5A3E2B] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <div className="relative">
            <select
              onChange={handleSortChange}
              className="appearance-none bg-[#FFFDF8] border border-[#DED2C2] rounded-lg px-3.5 py-2 pr-8 text-xs font-medium text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
            >
              <option value="newest">Sort By: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#806F61] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 1.5. Virtual Fitting Room Interactive Banner */}
      <div className="rounded-3xl border border-[#B58B45]/50 bg-gradient-to-r from-[#FAF4E8] via-[#FFFDF8] to-[#F3E5C8] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#B58B45]" />
              Virtual Fitting Room
            </span>
            <span className="text-xs text-[#806F61] font-medium">Real-Time Parametric Body Silhouette & Drape</span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F241D]">
            Unsure how a dress will fit your height & body curves?
          </h2>

          <p className="text-xs sm:text-sm text-[#806F61] leading-relaxed">
            Configure your 2.5D body mannequin or scan a full-body photo locally inside your browser (100% private). Preview hemline drops (midi vs floor length) and comfort ease across all sizes.
          </p>

          {bodyProfile && (
            <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#806F61] font-medium">Active Silhouette:</span>
              <span className="font-semibold text-[#5A3E2B] bg-[#E8D5B5]/60 px-2.5 py-1 rounded-lg border border-[#DED2C2]">
                {Math.floor(bodyProfile.heightInches / 12)}'{bodyProfile.heightInches % 12}" • {bodyProfile.bustInches}-{bodyProfile.waistInches}-{bodyProfile.hipInches} ({bodyProfile.archetype})
              </span>
              <span className="text-[#059669] font-bold bg-[#ecfdf5] px-2.5 py-1 rounded-lg border border-[#a7f3d0]">
                Best Fit: Size {bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFittingRoomProduct(products[0] || null);
              setIsFittingRoomOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#B58B45]" />
            <span>✨ {bodyProfile?.photoScanned ? 'Adjust My Avatar' : 'Try on Virtual Body'}</span>
          </button>

          {bodyProfile && (
            <button
              type="button"
              onClick={() => {
                const recSize = bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize;
                handleSizeToggle(recSize);
              }}
              className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                selectedSizes.includes(bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize)
                  ? 'bg-[#E8D5B5] border-[#B58B45] text-[#5A3E2B]'
                  : 'bg-[#FFFDF8] border-[#DED2C2] text-[#5A3E2B] hover:border-[#5A3E2B]'
              }`}
            >
              <span>
                {selectedSizes.includes(bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize)
                  ? `✓ Filtering Size ${bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize}`
                  : `Filter by My Size (${bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Filter Chips */}
      {(selectedSizes.length > 0 || selectedColors.length > 0 || search || minPrice || maxPrice) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#806F61]">Active Filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8D5B5] text-[#5A3E2B] text-xs font-medium">
              Search: "{search}"
              <button type="button" onClick={() => setSearch('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8D5B5] text-[#5A3E2B] text-xs font-medium"
            >
              Size: {s}
              <button type="button" onClick={() => handleSizeToggle(s)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedColors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8D5B5] text-[#5A3E2B] text-xs font-medium"
            >
              Color: {c}
              <button type="button" onClick={() => handleColorToggle(c)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8D5B5] text-[#5A3E2B] text-xs font-medium">
              Price: ${minPrice || '0'} - ${maxPrice || '3000'}
              <button type="button" onClick={() => handlePriceChange('', '')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-[#B58B45] hover:underline font-semibold ml-2"
          >
            Reset All
          </button>
        </div>
      )}

      {/* 3. Main Grid: Filter Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            facets={facets || null}
            selectedSizes={selectedSizes}
            selectedColors={selectedColors}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSizeToggle={handleSizeToggle}
            onColorToggle={handleColorToggle}
            onPriceChange={handlePriceChange}
            onClearFilters={handleClearFilters}
            bodyProfile={bodyProfile}
            recommendedSize={bodyProfile ? bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize : undefined}
            onOpenFittingRoom={() => {
              setFittingRoomProduct(products[0] || null);
              setIsFittingRoomOpen(true);
            }}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#806F61]">
            <span>
              Showing <strong className="text-[#2F241D]">{products.length}</strong> available dresses
            </span>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-4 space-y-3">
                  <div className="aspect-[3/4] bg-[#EFE5D5] rounded-xl" />
                  <div className="h-4 bg-[#EFE5D5] rounded w-3/4" />
                  <div className="h-3 bg-[#EFE5D5] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-8 space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#2F241D]">No matching dresses found</h3>
              <p className="text-xs text-[#806F61] max-w-sm mx-auto">
                Try widening your filters or clearing search keywords to view our complete collection.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 px-5 py-2 rounded-lg bg-[#5A3E2B] text-[#FFFDF8] text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onTryOn={(selectedDress) => {
                    setFittingRoomProduct(selectedDress);
                    setIsFittingRoomOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="fixed inset-0 bg-[#2F241D]/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-[#FFFDF8] p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#DED2C2] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#2F241D]">Filter Dresses</h3>
                  <button type="button" onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-[#806F61]" />
                  </button>
                </div>
                <FilterSidebar
                  facets={facets || null}
                  selectedSizes={selectedSizes}
                  selectedColors={selectedColors}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onSizeToggle={handleSizeToggle}
                  onColorToggle={handleColorToggle}
                  onPriceChange={handlePriceChange}
                  onClearFilters={handleClearFilters}
                  bodyProfile={bodyProfile}
                  recommendedSize={bodyProfile ? bodyProfileService.analyzeFit(bodyProfile, 'M', 48).recommendedSize : undefined}
                  onOpenFittingRoom={() => {
                    setFittingRoomProduct(products[0] || null);
                    setIsFittingRoomOpen(true);
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-6 py-3 rounded-xl bg-[#5A3E2B] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold"
              >
                Apply Filters ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Virtual Fitting Room Modal */}
      <VirtualFittingRoomModal
        isOpen={isFittingRoomOpen}
        onClose={() => setIsFittingRoomOpen(false)}
        product={fittingRoomProduct}
      />
    </div>
  );
}
