'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CustomerBodyProfile,
  SilhouetteArchetype,
  GenderCategory,
  ARCHETYPE_PRESETS,
  FEMALE_ARCHETYPE_PRESETS,
  MALE_ARCHETYPE_PRESETS,
  bodyProfileService,
} from '../../services/body-profile.service';
import { Product, ProductVariant } from '../../types';
import { cartService } from '../../services/cart.service';
import { MannequinCanvas } from './mannequin-canvas';
import { PhotoContourScanner } from './photo-contour-scanner';
import {
  X,
  Sparkles,
  Camera,
  Sliders,
  Check,
  Ruler,
  ShoppingBag,
  Info,
  ExternalLink,
} from 'lucide-react';

interface VirtualFittingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  selectedVariant?: ProductVariant | null;
  onApplySize?: (variant: ProductVariant) => void;
}

export const VirtualFittingRoomModal: React.FC<VirtualFittingRoomModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  onApplySize,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerBodyProfile>(bodyProfileService.getProfile());
  const [activeTab, setActiveTab] = useState<'sliders' | 'photo'>('sliders');
  const [testedSize, setTestedSize] = useState<string>(selectedVariant?.size || 'M');
  const [addedNotice, setAddedNotice] = useState(false);

  // Load saved profile on open
  useEffect(() => {
    if (isOpen) {
      const p = bodyProfileService.getProfile();
      setProfile(p);
      if (selectedVariant?.size) {
        setTestedSize(selectedVariant.size);
      } else {
        const analysis = bodyProfileService.analyzeFit(p, 'M', 48);
        setTestedSize(analysis.recommendedSize);
      }
    }
  }, [isOpen, selectedVariant]);

  // Compute live fit analysis
  const fitAnalysis = bodyProfileService.analyzeFit(profile, testedSize, 48);

  const handleGenderSelect = (gender: GenderCategory) => {
    if (gender === 'MALE') {
      const preset = MALE_ARCHETYPE_PRESETS.ATHLETIC_V_TAPER;
      const updated: CustomerBodyProfile = {
        ...profile,
        gender: 'MALE',
        archetype: 'ATHLETIC_V_TAPER',
        bustInches: preset.bust,
        waistInches: preset.waist,
        hipInches: preset.hips,
        shoulderInches: preset.shoulder || 19.5,
        heightInches: Math.max(66, profile.heightInches),
      };
      setProfile(updated);
      bodyProfileService.saveProfile(updated);
      const newAnalysis = bodyProfileService.analyzeFit(updated, testedSize, 48);
      setTestedSize(newAnalysis.recommendedSize);
    } else {
      const preset = FEMALE_ARCHETYPE_PRESETS.HOURGLASS;
      const updated: CustomerBodyProfile = {
        ...profile,
        gender: 'FEMALE',
        archetype: 'HOURGLASS',
        bustInches: preset.bust,
        waistInches: preset.waist,
        hipInches: preset.hips,
        shoulderInches: preset.shoulder || 15.5,
        heightInches: Math.min(68, profile.heightInches),
      };
      setProfile(updated);
      bodyProfileService.saveProfile(updated);
      const newAnalysis = bodyProfileService.analyzeFit(updated, testedSize, 48);
      setTestedSize(newAnalysis.recommendedSize);
    }
  };

  const handleSliderChange = (key: keyof CustomerBodyProfile, value: number) => {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    bodyProfileService.saveProfile(updated);
  };

  const handleArchetypeSelect = (archetype: SilhouetteArchetype) => {
    const preset = ARCHETYPE_PRESETS[archetype];
    const updated: CustomerBodyProfile = {
      ...profile,
      archetype,
      bustInches: preset.bust,
      waistInches: preset.waist,
      hipInches: preset.hips,
      shoulderInches: preset.shoulder || (profile.gender === 'MALE' ? 19.5 : 15.5),
    };
    setProfile(updated);
    bodyProfileService.saveProfile(updated);
  };

  const handlePhotoScanResult = (scanned: Partial<CustomerBodyProfile>) => {
    const updated = { ...profile, ...scanned };
    setProfile(updated);
    bodyProfileService.saveProfile(updated);
    const newAnalysis = bodyProfileService.analyzeFit(updated, testedSize, 48);
    setTestedSize(newAnalysis.recommendedSize);
  };

  const handleApplyRecommended = async () => {
    if (!product) {
      onClose();
      return;
    }

    const matchVariant =
      product.variants?.find((v) => v.size === testedSize && v.stock > 0) ||
      product.variants?.find((v) => v.size === testedSize) ||
      selectedVariant ||
      product.variants?.[0];

    if (matchVariant) {
      if (onApplySize) {
        onApplySize(matchVariant);
      }
      await cartService.addItem(product, matchVariant, 1);
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
        onClose();
      }, 1200);
    }
  };

  const handleNavigateToDress = () => {
    if (product) {
      onClose();
      router.push(`/products/${product.slug || product._id}`);
    }
  };

  if (!isOpen) return null;

  const distinctSizes = product?.variants?.length
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const currentColorHex =
    selectedVariant?.color?.hexCode ||
    product?.variants?.[0]?.color?.hexCode ||
    '#5A3E2B';

  const dressTitle = product ? product.name : (profile.gender === 'MALE' ? 'Tailored Atelier Ensemble' : 'Haute Couture Dress');

  const currentArchetypeList = profile.gender === 'MALE'
    ? (Object.keys(MALE_ARCHETYPE_PRESETS) as SilhouetteArchetype[])
    : (Object.keys(FEMALE_ARCHETYPE_PRESETS) as SilhouetteArchetype[]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#2F241D]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-5xl bg-[#FFFDF8] rounded-3xl border border-[#DED2C2] shadow-2xl overflow-hidden flex flex-col">
          {/* 1. Modal Top Bar */}
          <div className="p-5 border-b border-[#DED2C2] bg-[#F7F1E7]/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5A3E2B] text-[#B58B45] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2F241D]">
                  3D Virtual Fitting Room & Anatomical Studio
                </h3>
                <p className="text-xs text-[#806F61]">
                  {product ? (
                    <>Personalized fit analysis for <strong className="text-[#5A3E2B]">{product.name}</strong></>
                  ) : (
                    'Parametric 3D-shaded body visualizer with bone landmark detection'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Gender Category Toggle */}
              <div className="flex items-center bg-[#EFE5D5] p-1 rounded-xl border border-[#DED2C2]">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('FEMALE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    profile.gender === 'FEMALE'
                      ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                      : 'text-[#806F61] hover:text-[#2F241D]'
                  }`}
                >
                  ♀ Women
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('MALE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    profile.gender === 'MALE'
                      ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                      : 'text-[#806F61] hover:text-[#2F241D]'
                  }`}
                >
                  ♂ Men
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#806F61] hover:text-[#2F241D] hover:bg-[#EFE5D5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Main Two-Column Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 items-start">
            {/* Left Column: Mannequin Canvas & Fit Zones (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <MannequinCanvas
                profile={profile}
                fitAnalysis={fitAnalysis}
                selectedSize={testedSize}
                dressName={dressTitle}
                dressColorHex={currentColorHex}
                dressLengthInches={48}
              />

              {/* Size Selector Strip */}
              <div className="space-y-1.5 bg-[#FAF4E8] p-3 rounded-2xl border border-[#DED2C2]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2F241D]">
                  <span>Test Size On Body:</span>
                  <span className="text-[11px] text-[#B58B45]">
                    Recommended: Size {fitAnalysis.recommendedSize}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {distinctSizes.map((s) => {
                    const isTested = testedSize === s;
                    const isRecommended = fitAnalysis.recommendedSize === s;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTestedSize(s)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isTested
                            ? 'bg-[#5A3E2B] border-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                            : 'bg-[#FFFDF8] border-[#DED2C2] text-[#2F241D] hover:border-[#5A3E2B]'
                        }`}
                      >
                        {s} {isRecommended && '★'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fit Zones Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {fitAnalysis.zones.map((z) => (
                  <div key={z.zone} className="p-2.5 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] space-y-0.5 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#806F61]">{z.zone}</span>
                    <p
                      className={`font-bold text-xs ${
                        z.status === 'TIGHT'
                          ? 'text-[#e11d48]'
                          : z.status === 'SNUG'
                          ? 'text-[#B58B45]'
                          : 'text-[#059669]'
                      }`}
                    >
                      {z.status === 'TIGHT' ? 'Tight' : z.status === 'SNUG' ? 'Snug' : 'Comfortable'}
                    </p>
                    <span className="text-[9px] text-[#806F61] block leading-tight">
                      {z.ease >= 0 ? `+${z.ease.toFixed(1)}" ease` : `${z.ease.toFixed(1)}" tight`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Customization Controls (Photo Scan vs Sliders) (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Tabs: Sliders vs Photo Scan */}
              <div className="flex items-center border-b border-[#DED2C2]">
                <button
                  type="button"
                  onClick={() => setActiveTab('sliders')}
                  className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'sliders'
                      ? 'border-[#5A3E2B] text-[#5A3E2B]'
                      : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Measurements & Archetypes
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'photo'
                      ? 'border-[#5A3E2B] text-[#5A3E2B]'
                      : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-[#B58B45]" />
                  Scan from Photo (Multi-Point)
                </button>
              </div>

              {/* Tab 1: Sliders & Archetypes */}
              {activeTab === 'sliders' && (
                <div className="space-y-5">
                  {/* Silhouette Archetype Chips */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">
                      {profile.gender === 'MALE' ? 'Tailored Masculine Archetypes:' : 'Couture Feminine Archetypes:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {currentArchetypeList.map((arch) => {
                        const preset = ARCHETYPE_PRESETS[arch];
                        const isSelected = profile.archetype === arch;

                        return (
                          <button
                            key={arch}
                            type="button"
                            onClick={() => handleArchetypeSelect(arch)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-[#E8D5B5]/60 border-[#5A3E2B] shadow-xs'
                                : 'bg-[#F7F1E7]/40 border-[#DED2C2] hover:border-[#5A3E2B]'
                            }`}
                          >
                            <span className="font-bold text-xs text-[#2F241D] block">{preset.label}</span>
                            <span className="text-[10px] text-[#806F61] line-clamp-1">{preset.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sliders Area */}
                  <div className="space-y-3.5 bg-[#F7F1E7]/30 border border-[#DED2C2] rounded-2xl p-4">
                    {/* Height Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#2F241D]">Height</span>
                        <span className="font-serif font-bold text-[#5A3E2B]">
                          {Math.floor(profile.heightInches / 12)}' {profile.heightInches % 12}" (
                          {Math.round(profile.heightInches * 2.54)} cm)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="58" // 4'10"
                        max="76" // 6'4"
                        value={profile.heightInches}
                        onChange={(e) => handleSliderChange('heightInches', Number(e.target.value))}
                        className="w-full accent-[#5A3E2B] cursor-pointer"
                      />
                    </div>

                    {/* Chest / Bust Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#2F241D]">
                          {profile.gender === 'MALE' ? 'Chest Circumference' : 'Bust Circumference'}
                        </span>
                        <span className="font-serif font-bold text-[#5A3E2B]">{profile.bustInches}"</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="52"
                        value={profile.bustInches}
                        onChange={(e) => handleSliderChange('bustInches', Number(e.target.value))}
                        className="w-full accent-[#5A3E2B] cursor-pointer"
                      />
                    </div>

                    {/* Waist Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#2F241D]">Waist Circumference</span>
                        <span className="font-serif font-bold text-[#5A3E2B]">{profile.waistInches}"</span>
                      </div>
                      <input
                        type="range"
                        min="22"
                        max="46"
                        value={profile.waistInches}
                        onChange={(e) => handleSliderChange('waistInches', Number(e.target.value))}
                        className="w-full accent-[#5A3E2B] cursor-pointer"
                      />
                    </div>

                    {/* Hips Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#2F241D]">Hips Circumference</span>
                        <span className="font-serif font-bold text-[#5A3E2B]">{profile.hipInches}"</span>
                      </div>
                      <input
                        type="range"
                        min="32"
                        max="52"
                        value={profile.hipInches}
                        onChange={(e) => handleSliderChange('hipInches', Number(e.target.value))}
                        className="w-full accent-[#5A3E2B] cursor-pointer"
                      />
                    </div>

                    {/* Shoulders Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#2F241D]">Bi-Deltoid Shoulder Breadth</span>
                        <span className="font-serif font-bold text-[#5A3E2B]">{profile.shoulderInches || 16}"</span>
                      </div>
                      <input
                        type="range"
                        min="13"
                        max="24"
                        value={profile.shoulderInches || 16}
                        onChange={(e) => handleSliderChange('shoulderInches', Number(e.target.value))}
                        className="w-full accent-[#5A3E2B] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Photo Scan */}
              {activeTab === 'photo' && (
                <PhotoContourScanner onScanComplete={handlePhotoScanResult} />
              )}

              {/* Bottom Action: Apply Size & Close */}
              <div className="pt-4 border-t border-[#DED2C2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#806F61] text-center sm:text-left">
                  <span>Selected Fit: </span>
                  <strong className="text-[#5A3E2B] font-bold">Size {testedSize}</strong>
                  <span className="block text-[10px] text-[#806F61]">
                    Your {profile.gender === 'MALE' ? 'tailored male' : 'couture female'} avatar measurements are saved locally.
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {product && (
                    <button
                      type="button"
                      onClick={handleNavigateToDress}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#DED2C2] hover:border-[#5A3E2B] bg-[#FFFDF8] text-[#5A3E2B] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Dress Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyRecommended}
                    className={`w-full sm:w-auto px-7 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
                      addedNotice
                        ? 'bg-[#059669] text-[#FFFDF8]'
                        : 'bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8]'
                    }`}
                  >
                    {addedNotice ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag!</span>
                      </>
                    ) : product ? (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Size {testedSize} to Bag</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Silhouette & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
