'use client';

import React from 'react';
import { ProductFilterFacets } from '../../types';
import { CustomerBodyProfile } from '../../services/body-profile.service';
import { Filter, X, RotateCcw, Sparkles } from 'lucide-react';

interface FilterSidebarProps {
  facets: ProductFilterFacets | null;
  selectedSizes: string[];
  selectedColors: string[];
  minPrice: string;
  maxPrice: string;
  onSizeToggle: (size: string) => void;
  onColorToggle: (colorName: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onClearFilters: () => void;
  bodyProfile?: CustomerBodyProfile | null;
  recommendedSize?: string;
  onOpenFittingRoom?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  facets,
  selectedSizes,
  selectedColors,
  minPrice,
  maxPrice,
  onSizeToggle,
  onColorToggle,
  onPriceChange,
  onClearFilters,
  bodyProfile,
  recommendedSize,
  onOpenFittingRoom,
}) => {
  const hasActiveFilters =
    selectedSizes.length > 0 || selectedColors.length > 0 || minPrice !== '' || maxPrice !== '';

  const isMySizeSelected = recommendedSize ? selectedSizes.includes(recommendedSize) : false;

  return (
    <div className="bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-5 space-y-6 shadow-xs">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#DED2C2] pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5A3E2B]" />
          <h3 className="font-serif font-bold text-base text-[#2F241D]">Refine Edit</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-[#B58B45] hover:text-[#5A3E2B] font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* 2. Virtual Fitting Avatar Widget */}
      {onOpenFittingRoom && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF4E8] via-[#FFFDF8] to-[#F3E5C8] border border-[#B58B45]/50 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#B58B45] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B58B45]" />
              Virtual Avatar
            </span>
            {bodyProfile && (
              <span className="text-[10px] font-semibold text-[#059669]">
                {Math.floor(bodyProfile.heightInches / 12)}'{bodyProfile.heightInches % 12}" {bodyProfile.archetype}
              </span>
            )}
          </div>

          <p className="text-xs text-[#5A3E2B] font-medium leading-relaxed">
            {recommendedSize ? (
              <>Recommended Fit: <strong className="text-[#B58B45] font-bold">Size {recommendedSize}</strong> based on your body silhouette.</>
            ) : (
              'Set your body measurements or scan a photo to preview fit live on all dresses.'
            )}
          </p>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={onOpenFittingRoom}
              className="w-full py-2 px-3 rounded-lg bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B58B45]" />
              <span>{bodyProfile?.photoScanned ? 'Adjust Avatar' : 'Personalize Body Avatar'}</span>
            </button>

            {recommendedSize && (
              <button
                type="button"
                onClick={() => onSizeToggle(recommendedSize)}
                className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-all border ${
                  isMySizeSelected
                    ? 'bg-[#E8D5B5] border-[#B58B45] text-[#5A3E2B]'
                    : 'bg-[#FFFDF8] border-[#DED2C2] text-[#806F61] hover:border-[#5A3E2B]'
                }`}
              >
                {isMySizeSelected
                  ? `✓ Showing Size ${recommendedSize} Only`
                  : `Filter My Size (${recommendedSize})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Price Range */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Price Range ($)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-[#806F61] block mb-1">Min ($)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-2.5 py-1.5 text-xs text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#806F61] block mb-1">Max ($)</label>
            <input
              type="number"
              placeholder={facets?.priceRange?.max?.toString() || '3000'}
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-2.5 py-1.5 text-xs text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
            />
          </div>
        </div>
      </div>

      {/* 3. Sizes Filter */}
      {facets && facets.sizes && facets.sizes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#DED2C2]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Size</h4>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const isSelected = selectedSizes.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => onSizeToggle(s.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#5A3E2B] border-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                      : 'bg-[#F7F1E7] border-[#DED2C2] text-[#2F241D] hover:border-[#5A3E2B]'
                  }`}
                >
                  {s.code}
                  <span className={`ml-1 text-[10px] ${isSelected ? 'text-[#E8D5B5]' : 'text-[#806F61]'}`}>
                    ({s.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Colors Filter */}
      {facets && facets.colors && facets.colors.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#DED2C2]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Color Palette</h4>
          <div className="space-y-2">
            {facets.colors.map((c, idx) => {
              const isSelected = selectedColors.includes(c.name);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onColorToggle(c.name)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-[#E8D5B5]/50 font-semibold text-[#5A3E2B]' : 'hover:bg-[#F7F1E7] text-[#2F241D]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border shadow-2xs ${
                        isSelected ? 'ring-2 ring-[#5A3E2B] ring-offset-1' : 'border-[#DED2C2]'
                      }`}
                      style={{ backgroundColor: c.hexCode }}
                    />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-[10px] text-[#806F61]">({c.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
