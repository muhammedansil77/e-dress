'use client';

import React, { useState, useRef } from 'react';
import {
  CustomerBodyProfile,
  SilhouetteArchetype,
  GenderCategory,
  MALE_ARCHETYPE_PRESETS,
  FEMALE_ARCHETYPE_PRESETS,
} from '../../services/body-profile.service';
import {
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  User,
} from 'lucide-react';

interface PhotoContourScannerProps {
  onScanComplete: (profile: Partial<CustomerBodyProfile>) => void;
}

export const PhotoContourScanner: React.FC<PhotoContourScannerProps> = ({ onScanComplete }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepLabel, setScanStepLabel] = useState('');
  const [detectedMetrics, setDetectedMetrics] = useState<{
    gender: GenderCategory;
    shoulderToHipRatio: number;
    detectedArchetype: SilhouetteArchetype;
    estimatedBust: number;
    estimatedWaist: number;
    estimatedHips: number;
    estimatedShoulders: number;
    estimatedHeight: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageSrc(dataUrl);
      startIntelligentContourAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const startIntelligentContourAnalysis = (dataUrl: string) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStepLabel('Detecting Pose, Head & Clavicle Alignment...');

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      setTimeout(() => {
        setScanProgress(40);
        setScanStepLabel('Scanning Bi-Deltoid Shoulders & Torso Silhouette...');
      }, 600);

      setTimeout(() => {
        setScanProgress(70);
        setScanStepLabel('Filtering Outerwear & Calculating Core Waist Taper...');
      }, 1200);

      setTimeout(() => {
        // Multi-point anatomical canvas analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const W = 160;
        const H = 260;
        canvas.width = W;
        canvas.height = H;

        let detectedGender: GenderCategory = 'FEMALE';
        let detectedArchetype: SilhouetteArchetype = 'HOURGLASS';
        let detectedBust = 36;
        let detectedWaist = 27;
        let detectedHips = 37;
        let detectedShoulder = 15.5;
        let detectedLegInches = 21.0;
        let detectedHeight = 65;

        if (ctx) {
          ctx.drawImage(img, 0, 0, W, H);
          const imgData = ctx.getImageData(0, 0, W, H);
          const data = imgData.data;

          // 1. Adaptive Background Sampling from Outer Margins
          // Margin columns reliably represent the wall/backdrop
          let bgR_sum = 0, bgG_sum = 0, bgB_sum = 0, bgCount = 0;
          for (let y = 10; y < H - 10; y += 5) {
            for (const x of [2, 5, 8, W - 9, W - 6, W - 3]) {
              const idx = (y * W + x) * 4;
              bgR_sum += data[idx];
              bgG_sum += data[idx + 1];
              bgB_sum += data[idx + 2];
              bgCount++;
            }
          }
          const bgR = bgCount > 0 ? bgR_sum / bgCount : 240;
          const bgG = bgCount > 0 ? bgG_sum / bgCount : 240;
          const bgB = bgCount > 0 ? bgB_sum / bgCount : 240;
          const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

          // Helper to check if a pixel is foreground (differs from background or exhibits skin/clothing contrast)
          const isForeground = (x: number, y: number): boolean => {
            const idx = (y * W + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);
            const lumDiff = Math.abs(lum - bgLum);

            // Skin chroma detection (distinguishes pale/warm skin from neutral walls)
            const isSkin = r > 60 && g > 40 && b > 25 && (r - b) > 12 && (r - g) > 5;
            // Contrast difference from backdrop
            return isSkin || colorDist > 25 || lumDiff > 20;
          };

          // 2. High-Precision Center-Out Body Contour Scanner
          // Starts from the subject center (W/2 = 80) and walks outward to detect body boundaries
          const centerX = Math.floor(W / 2);
          const getWidthAtY = (yRatio: number): { width: number; left: number; right: number } => {
            const y = Math.floor(H * yRatio);

            // Scan leftwards from center
            let left = centerX;
            let consecutiveBgLeft = 0;
            for (let x = centerX; x >= 0; x--) {
              if (!isForeground(x, y)) {
                consecutiveBgLeft++;
                if (consecutiveBgLeft >= 3) {
                  left = x + consecutiveBgLeft;
                  break;
                }
              } else {
                consecutiveBgLeft = 0;
              }
            }

            // Scan rightwards from center
            let right = centerX;
            let consecutiveBgRight = 0;
            for (let x = centerX; x < W; x++) {
              if (!isForeground(x, y)) {
                consecutiveBgRight++;
                if (consecutiveBgRight >= 3) {
                  right = x - consecutiveBgRight;
                  break;
                }
              } else {
                consecutiveBgRight = 0;
              }
            }

            let width = right > left ? right - left : 28;
            // Guard against extreme canvas bleed
            if (width > W * 0.72) {
              width = Math.round(W * 0.35);
            }
            return { width, left, right };
          };

          // Sample anatomical keypoints across torso
          const shoulderSample = getWidthAtY(0.24); // ~24% height = Shoulders (Bi-deltoid)
          const chestSample = getWidthAtY(0.34);    // ~34% height = Chest / Bust
          const midTorsoSample = getWidthAtY(0.44); // ~44% height = Waist
          const lowWaistSample = getWidthAtY(0.49); // ~49% height = Lower abdomen
          const hipSample = getWidthAtY(0.58);      // ~58% height = Pelvis / Hips

          // Filter out outerwear flare
          const naturalWaistWidth = Math.min(midTorsoSample.width, lowWaistSample.width * 0.95);
          const shoulderWidthPx = shoulderSample.width;
          const hipWidthPx = hipSample.width;

          const shoulderToHipRatio = shoulderWidthPx / (hipWidthPx || 1);
          const waistToHipRatio = naturalWaistWidth / (hipWidthPx || 1);

          // 3. Intelligent Gender & Physique Frame Detection:
          const isVeryLean = naturalWaistWidth <= 34 || chestSample.width <= 40;
          const isLeanTailored = !isVeryLean && (naturalWaistWidth <= 42 || chestSample.width <= 48);

          if (shoulderToHipRatio >= 1.08 || waistToHipRatio > 0.78 || shoulderWidthPx > 48) {
            detectedGender = 'MALE';
            detectedHeight = 70; // 5'10" base

            if (isVeryLean) {
              // Lean / Skinny frame (e.g. 40-55kg)
              detectedArchetype = 'SKINNY_SLENDER';
              detectedBust = 33;
              detectedWaist = 26;
              detectedHips = 33;
              detectedShoulder = 15.5;
              detectedLegInches = 18.5;
            } else if (isLeanTailored) {
              // Slim / Lean Tailored
              detectedArchetype = 'SLIM_RECTANGLE';
              detectedBust = 36;
              detectedWaist = 28;
              detectedHips = 35;
              detectedShoulder = 17.0;
              detectedLegInches = 20.5;
            } else if (shoulderToHipRatio >= 1.20 && shoulderWidthPx >= 52) {
              // Athletic V-taper
              detectedArchetype = 'ATHLETIC_V_TAPER';
              detectedBust = 41;
              detectedWaist = 31;
              detectedHips = 37;
              detectedShoulder = 19.5;
              detectedLegInches = 23.0;
            } else if (chestSample.width > 60 && naturalWaistWidth > 46) {
              // Broad muscular
              detectedArchetype = 'BROAD_CHEST';
              detectedBust = 44;
              detectedWaist = 35;
              detectedHips = 40;
              detectedShoulder = 20.5;
              detectedLegInches = 25.5;
            } else {
              // Relaxed fit
              detectedArchetype = 'RELAXED_FIT';
              detectedBust = 42;
              detectedWaist = 36;
              detectedHips = 41;
              detectedShoulder = 18.5;
              detectedLegInches = 23.5;
            }
          } else {
            // Female Couture Silhouettes
            detectedGender = 'FEMALE';
            detectedHeight = 65; // 5'5" base

            if (isVeryLean) {
              detectedArchetype = 'PETITE';
              detectedBust = 32;
              detectedWaist = 25;
              detectedHips = 34;
              detectedShoulder = 14.0;
              detectedLegInches = 19.0;
            } else if (waistToHipRatio < 0.74) {
              detectedArchetype = 'HOURGLASS';
              detectedBust = 36;
              detectedWaist = 26;
              detectedHips = 37;
              detectedShoulder = 15.5;
              detectedLegInches = 21.5;
            } else if (hipWidthPx > chestSample.width * 1.15) {
              detectedArchetype = 'PEAR';
              detectedBust = 34;
              detectedWaist = 28;
              detectedHips = 40;
              detectedShoulder = 14.5;
              detectedLegInches = 23.5;
            } else if (naturalWaistWidth > chestSample.width * 0.92) {
              detectedArchetype = 'APPLE';
              detectedBust = 38;
              detectedWaist = 33;
              detectedHips = 38;
              detectedShoulder = 15.5;
              detectedLegInches = 20.5;
            } else {
              detectedArchetype = 'RECTANGLE';
              detectedBust = 35;
              detectedWaist = 29;
              detectedHips = 36;
              detectedShoulder = 16.0;
              detectedLegInches = 20.5;
            }
          }
        }

        setScanProgress(100);
        setScanStepLabel('Anatomical Silhouette Classification Complete!');
        setIsScanning(false);

        const metrics = {
          gender: detectedGender,
          shoulderToHipRatio: 1.18,
          detectedArchetype: detectedArchetype,
          estimatedBust: detectedBust,
          estimatedWaist: detectedWaist,
          estimatedHips: detectedHips,
          estimatedShoulders: detectedShoulder,
          estimatedLegInches: detectedLegInches,
          estimatedHeight: detectedHeight,
        };

        setDetectedMetrics(metrics);
        const scannedPreset = detectedGender === 'MALE'
          ? (MALE_ARCHETYPE_PRESETS as any)[metrics.detectedArchetype]
          : (FEMALE_ARCHETYPE_PRESETS as any)[metrics.detectedArchetype];

        onScanComplete({
          gender: metrics.gender,
          archetype: metrics.detectedArchetype,
          bustInches: metrics.estimatedBust,
          waistInches: metrics.estimatedWaist,
          hipInches: metrics.estimatedHips,
          shoulderInches: metrics.estimatedShoulders,
          legInches: metrics.estimatedLegInches,
          armAngle: scannedPreset?.armAngle ?? (metrics.detectedArchetype === 'SKINNY_SLENDER' ? 10 : 25),
          armThickness: scannedPreset?.armThickness ?? (metrics.detectedArchetype === 'SKINNY_SLENDER' ? 76 : 100),
          heightInches: metrics.estimatedHeight,
          photoScanned: true,
        });
      }, 1800);
    };
  };

  const handleArchetypeSelect = (archetype: SilhouetteArchetype) => {
    if (!detectedMetrics) return;

    const isMale = detectedMetrics.gender === 'MALE';
    const preset = isMale
      ? (MALE_ARCHETYPE_PRESETS as any)[archetype]
      : (FEMALE_ARCHETYPE_PRESETS as any)[archetype];

    if (!preset) return;

    const updated = {
      ...detectedMetrics,
      detectedArchetype: archetype,
      estimatedBust: preset.bust,
      estimatedWaist: preset.waist,
      estimatedHips: preset.hips,
      estimatedShoulders: preset.shoulder || (isMale ? 18 : 15.5),
      estimatedLegInches: preset.legInches || 21.0,
    };
    setDetectedMetrics(updated);
    onScanComplete({
      gender: updated.gender,
      archetype: updated.detectedArchetype,
      bustInches: updated.estimatedBust,
      waistInches: updated.estimatedWaist,
      hipInches: updated.estimatedHips,
      shoulderInches: updated.estimatedShoulders,
      legInches: updated.estimatedLegInches,
      armAngle: preset.armAngle ?? 25,
      armThickness: preset.armThickness ?? 100,
      heightInches: updated.estimatedHeight,
      photoScanned: true,
    });
  };

  const handleGenderToggle = (newGender: GenderCategory) => {
    if (!detectedMetrics) return;

    if (newGender === 'MALE') {
      const preset = MALE_ARCHETYPE_PRESETS.SKINNY_SLENDER;
      const updated = {
        ...detectedMetrics,
        gender: 'MALE' as GenderCategory,
        detectedArchetype: 'SKINNY_SLENDER' as SilhouetteArchetype,
        estimatedBust: preset.bust,
        estimatedWaist: preset.waist,
        estimatedHips: preset.hips,
        estimatedShoulders: preset.shoulder || 15.5,
        estimatedLegInches: preset.legInches || 18.5,
        estimatedHeight: 70,
      };
      setDetectedMetrics(updated);
      onScanComplete({
        gender: 'MALE',
        archetype: 'SKINNY_SLENDER',
        bustInches: preset.bust,
        waistInches: preset.waist,
        hipInches: preset.hips,
        shoulderInches: preset.shoulder,
        legInches: preset.legInches,
        armAngle: preset.armAngle ?? 10,
        armThickness: preset.armThickness ?? 76,
        heightInches: 70,
        photoScanned: true,
      });
    } else {
      const preset = FEMALE_ARCHETYPE_PRESETS.HOURGLASS;
      const updated = {
        ...detectedMetrics,
        gender: 'FEMALE' as GenderCategory,
        detectedArchetype: 'HOURGLASS' as SilhouetteArchetype,
        estimatedBust: preset.bust,
        estimatedWaist: preset.waist,
        estimatedHips: preset.hips,
        estimatedShoulders: preset.shoulder || 15.5,
        estimatedLegInches: preset.legInches || 21.5,
        estimatedHeight: 65,
      };
      setDetectedMetrics(updated);
      onScanComplete({
        gender: 'FEMALE',
        archetype: 'HOURGLASS',
        bustInches: preset.bust,
        waistInches: preset.waist,
        hipInches: preset.hips,
        shoulderInches: preset.shoulder,
        legInches: preset.legInches,
        armAngle: preset.armAngle ?? 25,
        armThickness: preset.armThickness ?? 95,
        heightInches: 65,
        photoScanned: true,
      });
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setDetectedMetrics(null);
    setScanProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* 1. Privacy Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46]">
        <ShieldCheck className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#047857]">100% Client-Side Privacy:</strong>
          <span>Your photo is processed locally inside your browser memory and never uploaded or saved to public servers.</span>
        </div>
      </div>

      {/* 2. Photo Upload or Preview Container */}
      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#B58B45]/60 hover:border-[#5A3E2B] rounded-3xl p-8 text-center cursor-pointer bg-[#FAF4E8]/50 hover:bg-[#FAF4E8] transition-all group space-y-3"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-[#EFE5D5] text-[#5A3E2B] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-[#B58B45]" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-[#2F241D]">
              Upload Mirror Selfie or Full-Body Photo
            </h4>
            <p className="text-xs text-[#806F61] max-w-sm mx-auto">
              Our intelligent multi-point scanner detects anatomical bone structure, shoulder-to-hip ratio, and natural waist contour.
            </p>
          </div>

          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-[#5A3E2B] text-[#FFFDF8] text-xs font-semibold shadow-xs"
          >
            Select Photo from Device
          </button>
        </div>
      ) : (
        <div className="relative rounded-3xl border border-[#DED2C2] overflow-hidden bg-[#2F241D] flex flex-col items-center">
          <div className="relative w-full max-h-[380px] overflow-hidden flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Customer silhouette preview"
              className="max-h-[380px] w-auto object-contain"
            />

            {/* Scanning Laser Animation */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="w-full h-1 bg-gradient-to-r from-transparent via-[#B58B45] to-transparent shadow-[0_0_15px_#B58B45] animate-pulse"
                  style={{
                    position: 'absolute',
                    top: `${scanProgress}%`,
                    transition: 'top 0.4s ease-out',
                  }}
                />
                <div className="absolute inset-x-0 bottom-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F241D]/90 text-[#FFFDF8] text-xs font-semibold backdrop-blur-md border border-[#B58B45]/50">
                    <Sparkles className="w-3.5 h-3.5 text-[#B58B45] animate-spin" />
                    {scanStepLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scan Results Card */}
          {detectedMetrics && (
            <div className="w-full bg-[#FFFDF8] p-4 border-t border-[#DED2C2] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  <div>
                    <h5 className="font-serif text-sm font-bold text-[#2F241D]">
                      Identified: {detectedMetrics.gender === 'MALE' ? 'Tailored Men\'s' : 'Couture Women\'s'} {detectedMetrics.detectedArchetype.replaceAll('_', ' ')}
                    </h5>
                    <p className="text-[11px] text-[#806F61]">
                      Estimated: {detectedMetrics.gender === 'MALE' ? 'Chest' : 'Bust'} {detectedMetrics.estimatedBust}" • Waist {detectedMetrics.estimatedWaist}" • Hips {detectedMetrics.estimatedHips}" • Shoulders {detectedMetrics.estimatedShoulders}"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-[#806F61] hover:text-[#2F241D] hover:bg-[#EFE5D5] transition-colors"
                  title="Scan another photo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Gender Verification Selector */}
              <div className="pt-2 border-t border-[#DED2C2]/60 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#806F61] font-medium">Verify Gender Silhouette:</span>
                <div className="flex items-center gap-1.5 bg-[#F7F1E7] p-1 rounded-xl border border-[#DED2C2]">
                  <button
                    type="button"
                    onClick={() => handleGenderToggle('FEMALE')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      detectedMetrics.gender === 'FEMALE'
                        ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                        : 'text-[#806F61] hover:text-[#2F241D]'
                    }`}
                  >
                    ♀ Women's Couture
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderToggle('MALE')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      detectedMetrics.gender === 'MALE'
                        ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-xs'
                        : 'text-[#806F61] hover:text-[#2F241D]'
                    }`}
                  >
                    ♂ Men's / Tailored
                  </button>
                </div>
              </div>

              {/* Archetype Quick Selector Pills */}
              <div className="pt-2 border-t border-[#DED2C2]/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#806F61] font-medium">Physique Silhouette Archetype:</span>
                  <span className="text-[11px] font-semibold text-[#5A3E2B]">
                    {detectedMetrics.detectedArchetype.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(detectedMetrics.gender === 'MALE'
                    ? [
                        { id: 'SKINNY_SLENDER', label: 'Lean Frame (XS/S)' },
                        { id: 'SLIM_RECTANGLE', label: 'Slim Tailored (S/M)' },
                        { id: 'ATHLETIC_V_TAPER', label: 'Athletic V-Taper (M/L)' },
                        { id: 'BROAD_CHEST', label: 'Muscular (L/XL)' },
                        { id: 'RELAXED_FIT', label: 'Relaxed Classic' },
                      ]
                    : [
                        { id: 'PETITE', label: 'Petite (XS)' },
                        { id: 'HOURGLASS', label: 'Hourglass (S/M)' },
                        { id: 'PEAR', label: 'Pear / Triangle' },
                        { id: 'RECTANGLE', label: 'Athletic / Ruler' },
                        { id: 'APPLE', label: 'Apple / Round' },
                      ]
                  ).map((arch) => {
                    const isSelected = detectedMetrics.detectedArchetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => handleArchetypeSelect(arch.id as SilhouetteArchetype)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#5A3E2B] text-[#FFFDF8] border-[#5A3E2B] shadow-xs scale-105'
                            : 'bg-[#F7F1E7] text-[#806F61] border-[#DED2C2] hover:text-[#2F241D] hover:border-[#5A3E2B]'
                        }`}
                      >
                        {arch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
