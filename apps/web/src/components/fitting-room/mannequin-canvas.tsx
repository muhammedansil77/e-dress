'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CustomerBodyProfile, BodyFitAnalysis, AVATAR_POSES, AvatarPose } from '../../services/body-profile.service';
import { Sparkles, Ruler, Shield, Layers, User, Palette, Sliders } from 'lucide-react';
import { SKIN_TONES, SkinTone } from './human-avatar-3d-scene';

// Dynamic import with SSR disabled to ensure Three.js only runs in browser
const HumanAvatar3DScene = dynamic(
  () => import('./human-avatar-3d-scene').then((mod) => mod.HumanAvatar3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] sm:h-[440px] flex flex-col items-center justify-center gap-2 bg-[#F7F1E7]/50 rounded-2xl">
        <div className="w-8 h-8 rounded-full border-2 border-[#5A3E2B] border-t-transparent animate-spin" />
        <span className="text-xs text-[#806F61] font-medium">Initializing 3D Anatomical Studio...</span>
      </div>
    ),
  }
);

interface MannequinCanvasProps {
  profile: CustomerBodyProfile;
  fitAnalysis: BodyFitAnalysis;
  selectedSize: string;
  dressName: string;
  dressColorHex?: string;
  dressLengthInches?: number;
  onUpdateProfile?: (profile: Partial<CustomerBodyProfile>) => void;
}

export const MannequinCanvas: React.FC<MannequinCanvasProps> = ({
  profile,
  fitAnalysis,
  selectedSize,
  dressName,
  dressColorHex = '#5A3E2B',
  dressLengthInches = 48,
  onUpdateProfile,
}) => {
  const isMale = profile.gender === 'MALE';
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone>(SKIN_TONES[1]); // Warm Ivory default
  const [viewMode, setViewMode] = useState<'body' | 'dress' | 'heatmap'>('body');
  const [isFineTuningOpen, setIsFineTuningOpen] = useState(false);

  // Status zones
  const upperZone = fitAnalysis.zones.find((z) => z.zone === (isMale ? 'Chest' : 'Bust'));
  const waistZone = fitAnalysis.zones.find((z) => z.zone === 'Waist');
  const hipZone = fitAnalysis.zones.find((z) => z.zone === 'Hips');

  const getStatusColor = (status?: string) => {
    if (status === 'TIGHT') return '#e11d48'; // Red
    if (status === 'SNUG') return '#B58B45';  // Gold
    return '#059669'; // Green
  };

  return (
    <div className="relative bg-gradient-to-b from-[#FFFDF8] via-[#FDFBF7] to-[#F7F1E7] rounded-3xl border border-[#DED2C2] p-4 flex flex-col items-center justify-between shadow-xs select-none">
      {/* 1. Top Badges: Silhouette & Fit Score */}
      <div className="w-full flex items-center justify-between z-10 text-xs gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE5D5] text-[#5A3E2B] font-semibold text-[11px] shadow-2xs">
          <Ruler className="w-3.5 h-3.5 text-[#B58B45]" />
          <span>
            {Math.floor(profile.heightInches / 12)}'{profile.heightInches % 12}" • {isMale ? 'Tailored' : 'Couture'} {profile.archetype.replaceAll('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] font-bold text-[11px] shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#059669]" />
          <span>{fitAnalysis.confidenceScore}% Match ({selectedSize})</span>
        </div>
      </div>

      {/* 2. Trying On Dress Banner */}
      <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-[#FAF4E8] border border-[#DED2C2] rounded-xl text-xs mb-1.5">
        <div className="flex items-center gap-2 truncate">
          <span
            className="w-3.5 h-3.5 rounded-full border border-[#5A3E2B]/40 shadow-2xs shrink-0"
            style={{ backgroundColor: dressColorHex }}
          />
          <span className="text-[#806F61] text-[11px] truncate">
            Fitting: <strong className="text-[#5A3E2B] font-semibold">{dressName}</strong>
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#B58B45] shrink-0 uppercase tracking-wider">
          Dress Color
        </span>
      </div>

      {/* 3. Studio Controls Header: View Mode & Skin Tone Selector */}
      <div className="w-full flex items-center justify-between gap-2 px-1 py-1.5 bg-[#FAF4E8]/80 border border-[#DED2C2] rounded-2xl mb-1 text-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#EFE5D5] p-0.5 rounded-xl gap-0.5">
          <button
            type="button"
            onClick={() => setViewMode('body')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'body'
                ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                : 'text-[#806F61] hover:text-[#2F241D]'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Clean Body</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dress')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'dress'
                ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                : 'text-[#806F61] hover:text-[#2F241D]'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Fit Dress</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'heatmap'
                ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                : 'text-[#806F61] hover:text-[#2F241D]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Heatmap</span>
          </button>
        </div>

        {/* Skin Tone Palette Swatches */}
        <div className="flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-[#806F61] hidden sm:block" />
          <div className="flex items-center gap-1">
            {SKIN_TONES.map((tone) => {
              const isSelected = selectedSkinTone.id === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  title={tone.name}
                  onClick={() => setSelectedSkinTone(tone)}
                  style={{ backgroundColor: tone.hex }}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    isSelected
                      ? 'border-[#5A3E2B] scale-125 ring-2 ring-[#B58B45]/40 shadow-xs'
                      : 'border-[#DED2C2] hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2.5 Pose Quick-Selector Toolbar (Cleanly positioned above canvas without blocking 3D avatar) */}
      {onUpdateProfile && (
        <div className="w-full flex items-center justify-between gap-1.5 bg-[#FAF4E8]/90 border border-[#DED2C2] p-1 rounded-xl text-xs my-0.5">
          <span className="text-[10px] font-bold text-[#806F61] uppercase tracking-wider pl-1.5 shrink-0">
            Pose:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {AVATAR_POSES.map((poseItem) => {
              const isActive = (profile.pose || 'NATURAL_SIDES') === poseItem.id;
              return (
                <button
                  key={poseItem.id}
                  type="button"
                  onClick={() => onUpdateProfile({ pose: poseItem.id })}
                  title={poseItem.description}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                      : 'text-[#806F61] hover:text-[#2F241D] hover:bg-[#EFE5D5]'
                  }`}
                >
                  <span>{poseItem.icon}</span>
                  <span className="whitespace-nowrap">{poseItem.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 3D Real-time Human Avatar Canvas */}
      <div className="w-full relative my-1">
        <HumanAvatar3DScene
          profile={profile}
          fitAnalysis={fitAnalysis}
          selectedSize={selectedSize}
          dressName={dressName}
          dressColorHex={dressColorHex}
          dressLengthInches={dressLengthInches}
          selectedSkinTone={selectedSkinTone}
          viewMode={viewMode}
          onUpdateProfile={onUpdateProfile}
        />

        {/* Floating Anatomical Landmark Tags */}
        <div className="absolute top-4 left-3 space-y-2 pointer-events-none text-[10px]">
          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#DED2C2] shadow-2xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(upperZone?.status) }}
            />
            <span className="font-semibold text-[#5A3E2B]">
              {isMale ? 'Chest' : 'Bust'}: {profile.bustInches}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#DED2C2] shadow-2xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(waistZone?.status) }}
            />
            <span className="font-semibold text-[#5A3E2B]">
              Waist: {profile.waistInches}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#DED2C2] shadow-2xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(hipZone?.status) }}
            />
            <span className="font-semibold text-[#5A3E2B]">
              Hips: {profile.hipInches}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#DED2C2] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#B58B45]" />
            <span className="font-semibold text-[#5A3E2B]">
              Shoulders: {profile.shoulderInches || (isMale ? 18 : 15.5)}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#DED2C2] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#806F61]" />
            <span className="font-semibold text-[#5A3E2B]">
              Pose: {AVATAR_POSES.find((p) => p.id === (profile.pose || 'NATURAL_SIDES'))?.shortLabel}
            </span>
          </div>
        </div>

        {/* Floating Hemline Indicator Tag */}
        <div className="absolute top-4 right-3 pointer-events-none text-[10px]">
          <div className="flex items-center gap-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-[#B58B45]/50 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B58B45]" />
            <span className="font-bold text-[#5A3E2B]">
              Hemline: {fitAnalysis.hemlineLevel}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Fine-Tune Chest, Shoulders, Legs & Hands Shape Bar */}
      {onUpdateProfile && (
        <div className="w-full mt-2 bg-[#FAF4E8] rounded-2xl border border-[#DED2C2] overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setIsFineTuningOpen(!isFineTuningOpen)}
            className="w-full px-3 py-2 flex items-center justify-between font-bold text-[#5A3E2B] hover:bg-[#EFE5D5]/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#B58B45]" />
              <span>Control Shape, Legs, Hands & Avatar Poses</span>
            </div>
            <span className="text-[11px] font-semibold text-[#806F61]">
              {isFineTuningOpen ? 'Hide Controls ▲' : 'Tune Shape ▼'}
            </span>
          </button>

          {isFineTuningOpen && (
            <div className="p-3 pt-2 border-t border-[#DED2C2] space-y-3 bg-[#FFFDF8]">
              {/* Shoulder Width Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Shoulder Width (Bi-Deltoid):</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.shoulderInches || (isMale ? 18 : 15.5)}" •{' '}
                    <span className="font-normal text-[#806F61]">
                      {(profile.shoulderInches || 18) <= 16.5 ? 'Narrow / Slender Frame' : (profile.shoulderInches || 18) <= 19.5 ? 'Athletic V-Frame' : 'Broad Muscular'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="22"
                  step="0.5"
                  value={profile.shoulderInches || (isMale ? 18 : 15.5)}
                  onChange={(e) => onUpdateProfile({ shoulderInches: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Chest Breadth & Pectoral Depth Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Chest Circumference & Pecs:</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.bustInches}" •{' '}
                    <span className="font-normal text-[#806F61]">
                      {profile.bustInches <= 35 ? 'Lean Ribcage / Flat Pecs' : profile.bustInches <= 41 ? 'Defined Athletic' : 'Powerful Full Pecs'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="48"
                  step="0.5"
                  value={profile.bustInches}
                  onChange={(e) => onUpdateProfile({ bustInches: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Core Waist Taper Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Core Waist Taper:</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.waistInches}" •{' '}
                    <span className="font-normal text-[#806F61]">
                      {profile.waistInches <= 28 ? 'Slender Trim Waist' : profile.waistInches <= 33 ? 'Athletic Core' : 'Classic Fit'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="42"
                  step="0.5"
                  value={profile.waistInches}
                  onChange={(e) => onUpdateProfile({ waistInches: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Legs & Thighs Slimming / Bulking Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Legs & Thighs (Slim vs Bulked):</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.legInches || (isMale ? 22 : 21)}" •{' '}
                    <span className="font-normal text-[#806F61]">
                      {(profile.legInches || 22) <= 19.5
                        ? 'Ultra Slim / Skinny Legs'
                        : (profile.legInches || 22) <= 23.5
                        ? 'Tailored Athletic Legs'
                        : 'Bulked Muscular Quads & Calves'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="28"
                  step="0.5"
                  value={profile.legInches || (isMale ? 22 : 21)}
                  onChange={(e) => onUpdateProfile({ legInches: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Hand & Arm Stance Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Hand & Arm Stance (Proximity to Body):</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.armAngle !== undefined ? profile.armAngle : (profile.archetype === 'SKINNY_SLENDER' ? 10 : 25)}% •{' '}
                    <span className="font-normal text-[#806F61]">
                      {(profile.armAngle !== undefined ? profile.armAngle : 25) <= 15
                        ? 'Resting at Sides / Thighs (Photo Match)'
                        : (profile.armAngle !== undefined ? profile.armAngle : 25) <= 45
                        ? 'Relaxed Low Stance'
                        : 'Open A-Pose'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={profile.armAngle !== undefined ? profile.armAngle : (profile.archetype === 'SKINNY_SLENDER' ? 10 : 25)}
                  onChange={(e) => onUpdateProfile({ armAngle: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Hand & Wrist Build Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Hand & Wrist Build (Slim vs Muscular):</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {profile.armThickness !== undefined ? profile.armThickness : (profile.archetype === 'SKINNY_SLENDER' ? 76 : 100)}% •{' '}
                    <span className="font-normal text-[#806F61]">
                      {(profile.armThickness !== undefined ? profile.armThickness : 100) <= 80
                        ? 'Ultra Slender Wrists & Skinny Hands'
                        : (profile.armThickness !== undefined ? profile.armThickness : 100) <= 105
                        ? 'Natural Balanced Hands'
                        : 'Broad Muscular Forearms & Hands'}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="1"
                  value={profile.armThickness !== undefined ? profile.armThickness : (profile.archetype === 'SKINNY_SLENDER' ? 76 : 100)}
                  onChange={(e) => onUpdateProfile({ armThickness: Number(e.target.value) })}
                  className="w-full accent-[#5A3E2B] cursor-pointer h-1.5 bg-[#EFE5D5] rounded-lg"
                />
              </div>

              {/* Avatar Pose Selection Section */}
              <div className="space-y-2 pt-2 border-t border-[#DED2C2]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2F241D]">Choose 3D Avatar Pose & Stance:</span>
                  <span className="font-bold text-[#5A3E2B]">
                    {AVATAR_POSES.find((p) => p.id === (profile.pose || 'NATURAL_SIDES'))?.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {AVATAR_POSES.map((poseItem) => {
                    const isSelected = (profile.pose || 'NATURAL_SIDES') === poseItem.id;
                    return (
                      <button
                        key={poseItem.id}
                        type="button"
                        onClick={() => onUpdateProfile({ pose: poseItem.id })}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E8D5B5]/60 border-[#5A3E2B] shadow-xs ring-1 ring-[#5A3E2B]/20'
                            : 'bg-[#FFFDF8] border-[#DED2C2] hover:border-[#5A3E2B]/60 hover:bg-[#FAF4E8]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm">{poseItem.icon}</span>
                          <span className="font-bold text-[11px] text-[#2F241D]">
                            {poseItem.label}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#806F61] line-clamp-1">
                          {poseItem.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Description Card */}
      <div className="w-full bg-[#FAF4E8] rounded-xl border border-[#DED2C2] p-2.5 text-center text-xs mt-2">
        <p className="font-semibold text-[#5A3E2B]">
          {fitAnalysis.hemlineDropDescription}
        </p>
      </div>
    </div>
  );
};
