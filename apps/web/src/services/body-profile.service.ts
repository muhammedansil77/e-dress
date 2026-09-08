export type GenderCategory = 'FEMALE' | 'MALE';

export type FemaleArchetype = 'HOURGLASS' | 'PEAR' | 'RECTANGLE' | 'APPLE' | 'PETITE';
export type MaleArchetype = 'SKINNY_SLENDER' | 'SLIM_RECTANGLE' | 'ATHLETIC_V_TAPER' | 'BROAD_CHEST' | 'RELAXED_FIT';
export type SilhouetteArchetype = FemaleArchetype | MaleArchetype;

export type AvatarPose = 'NATURAL_SIDES' | 'RELAXED_STANCE' | 'FASHION_RUNWAY' | 'OPEN_A_POSE' | 'TAILORED_FIT';

export interface AvatarPoseInfo {
  id: AvatarPose;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const AVATAR_POSES: AvatarPoseInfo[] = [
  {
    id: 'NATURAL_SIDES',
    label: 'Natural Standing',
    shortLabel: 'Natural',
    icon: '🧍',
    description: 'Relaxed stance with arms resting naturally alongside hips & thighs',
  },
  {
    id: 'RELAXED_STANCE',
    label: 'Relaxed Stance',
    shortLabel: 'Relaxed',
    icon: '🕺',
    description: 'Casual contemporary posture with arms slightly off the hips',
  },
  {
    id: 'FASHION_RUNWAY',
    label: 'Runway Stride',
    shortLabel: 'Runway',
    icon: '🚶',
    description: 'Dynamic walking contrapposto showing fabric movement and drape',
  },
  {
    id: 'OPEN_A_POSE',
    label: 'Open A-Pose',
    shortLabel: 'A-Pose',
    icon: '🙆',
    description: 'Flared arms for complete 360° inspection of sleeves and garment ease',
  },
  {
    id: 'TAILORED_FIT',
    label: 'Tailored Fit',
    shortLabel: 'Tailored',
    icon: '📐',
    description: 'Upright streamlined silhouette for evaluating outerwear & tailored drape',
  },
];

export interface CustomerBodyProfile {
  gender: GenderCategory;
  heightInches: number; // e.g. 65 for 5'5"
  bustInches: number;   // Bust for women, Chest for men
  waistInches: number;  // e.g. 28
  hipInches: number;    // e.g. 38
  shoulderInches?: number; // e.g. 18 for men
  legInches?: number;   // e.g. 18.5 for slender, 25 for muscular quads
  armAngle?: number;    // 0 (resting alongside hips) to 100 (open A-pose)
  armThickness?: number; // 70 (slender/skinny arms) to 130 (muscular arms)
  pose?: AvatarPose;    // Active 3D avatar pose
  archetype: SilhouetteArchetype;
  photoScanned: boolean;
  lastUpdated: string;
}

export interface FitZoneAnalysis {
  zone: 'Bust' | 'Chest' | 'Waist' | 'Hips';
  bodyMeasurement: number;
  garmentMeasurement: number;
  ease: number; // garment - body
  status: 'COMFORTABLE' | 'SNUG' | 'TIGHT';
  message: string;
}

export interface BodyFitAnalysis {
  recommendedSize: string;
  confidenceScore: number;
  hemlineDropDescription: string;
  hemlineLevel: 'FLOOR' | 'ANKLE' | 'MID_CALF' | 'KNEE' | 'ABOVE_KNEE';
  zones: FitZoneAnalysis[];
}

const STORAGE_KEY = 'haute_customer_body_profile';

export const FEMALE_ARCHETYPE_PRESETS: Record<
  FemaleArchetype,
  { label: string; description: string; bust: number; waist: number; hips: number; shoulder?: number; legInches?: number; armAngle?: number; armThickness?: number }
> = {
  HOURGLASS: {
    label: 'Hourglass',
    description: 'Balanced bust and hips with a naturally defined waistline',
    bust: 36,
    waist: 27,
    hips: 37,
    shoulder: 15.5,
    legInches: 21.5,
    armAngle: 25,
    armThickness: 95,
  },
  PEAR: {
    label: 'Pear / Triangle',
    description: 'Wider hips and thighs with a narrower upper torso and shoulders',
    bust: 34,
    waist: 28,
    hips: 40,
    shoulder: 14.5,
    legInches: 23.5,
    armAngle: 30,
    armThickness: 92,
  },
  RECTANGLE: {
    label: 'Athletic / Ruler',
    description: 'Uniform shoulder, waist, and hip proportions with athletic tone',
    bust: 35,
    waist: 30,
    hips: 36,
    shoulder: 16,
    legInches: 20.5,
    armAngle: 20,
    armThickness: 95,
  },
  APPLE: {
    label: 'Apple / Round',
    description: 'Fuller midsection and bust with shapely, slender legs',
    bust: 38,
    waist: 33,
    hips: 38,
    shoulder: 15.5,
    legInches: 20.5,
    armAngle: 25,
    armThickness: 100,
  },
  PETITE: {
    label: 'Petite',
    description: 'Compact proportions under 5 ft 3 in with delicate frame',
    bust: 32,
    waist: 25,
    hips: 34,
    shoulder: 14,
    legInches: 19.0,
    armAngle: 15,
    armThickness: 80,
  },
};

export const MALE_ARCHETYPE_PRESETS: Record<
  MaleArchetype,
  { label: string; description: string; bust: number; waist: number; hips: number; shoulder?: number; legInches?: number; armAngle?: number; armThickness?: number }
> = {
  SKINNY_SLENDER: {
    label: 'Lean / Slender Frame',
    description: 'Ultra-lean, narrow silhouette with slender ribcage, waist, and limbs',
    bust: 33,
    waist: 26,
    hips: 33,
    shoulder: 15.5,
    legInches: 18.5,
    armAngle: 15,
    armThickness: 76,
  },
  SLIM_RECTANGLE: {
    label: 'Slim / Lean Tailored',
    description: 'Linear contemporary silhouette with balanced, tailored proportions',
    bust: 36,
    waist: 28,
    hips: 35,
    shoulder: 17.0,
    legInches: 20.5,
    armAngle: 20,
    armThickness: 88,
  },
  ATHLETIC_V_TAPER: {
    label: 'Athletic V-Taper',
    description: 'Broad sculpted shoulders tapering down to a lean, defined waistline',
    bust: 41,
    waist: 31,
    hips: 37,
    shoulder: 19.5,
    legInches: 23.0,
    armAngle: 30,
    armThickness: 105,
  },
  BROAD_CHEST: {
    label: 'Broad / Muscular',
    description: 'Powerful upper torso, wide chest, and athletic posture',
    bust: 44,
    waist: 35,
    hips: 40,
    shoulder: 20.5,
    legInches: 25.5,
    armAngle: 40,
    armThickness: 122,
  },
  RELAXED_FIT: {
    label: 'Classic / Relaxed',
    description: 'Generous cut through chest and midsection for comfort drape',
    bust: 42,
    waist: 36,
    hips: 41,
    shoulder: 18.5,
    legInches: 23.5,
    armAngle: 25,
    armThickness: 105,
  },
};

export const ARCHETYPE_PRESETS: Record<
  SilhouetteArchetype,
  { label: string; description: string; bust: number; waist: number; hips: number; shoulder?: number; legInches?: number; armAngle?: number; armThickness?: number }
> = {
  ...FEMALE_ARCHETYPE_PRESETS,
  ...MALE_ARCHETYPE_PRESETS,
};

// Standard garment measurement estimations per size code (in inches)
export const GARMENT_SPECS_BY_SIZE: Record<
  string,
  { bust: number; waist: number; hips: number; length: number }
> = {
  XS: { bust: 33, waist: 25, hips: 35, length: 47 },
  S: { bust: 35, waist: 27, hips: 37, length: 48 },
  M: { bust: 37, waist: 29, hips: 39, length: 49 },
  L: { bust: 39, waist: 32, hips: 42, length: 50 },
  XL: { bust: 42, waist: 35, hips: 45, length: 51 },
  XXL: { bust: 45, waist: 38, hips: 48, length: 51 },
};

export const MALE_GARMENT_SPECS_BY_SIZE: Record<
  string,
  { bust: number; waist: number; hips: number; length: number }
> = {
  XS: { bust: 35, waist: 28, hips: 34, length: 30 },
  S: { bust: 37, waist: 30, hips: 36, length: 30.5 },
  M: { bust: 40, waist: 33, hips: 39, length: 31 },
  L: { bust: 43, waist: 36, hips: 42, length: 32 },
  XL: { bust: 46, waist: 39, hips: 45, length: 32.5 },
  XXL: { bust: 49, waist: 42, hips: 48, length: 33 },
};

export const bodyProfileService = {
  getProfile: (): CustomerBodyProfile => {
    if (typeof window === 'undefined') {
      return {
        gender: 'FEMALE',
        heightInches: 65, // 5'5"
        bustInches: 36,
        waistInches: 28,
        hipInches: 38,
        shoulderInches: 15.5,
        archetype: 'HOURGLASS',
        photoScanned: false,
        lastUpdated: new Date().toISOString(),
      };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.gender) {
          parsed.gender = 'FEMALE';
        }
        if (!parsed.shoulderInches) {
          parsed.shoulderInches = parsed.gender === 'MALE' ? 19 : 15.5;
        }
        if (!parsed.legInches) {
          parsed.legInches = parsed.gender === 'MALE' ? 22 : 21;
        }
        if (parsed.armAngle === undefined) {
          parsed.armAngle = parsed.archetype === 'SKINNY_SLENDER' ? 10 : 25;
        }
        if (parsed.armThickness === undefined) {
          parsed.armThickness = parsed.archetype === 'SKINNY_SLENDER' ? 76 : 100;
        }
        if (!parsed.pose || !['NATURAL_SIDES', 'RELAXED_STANCE', 'FASHION_RUNWAY', 'OPEN_A_POSE', 'TAILORED_FIT'].includes(parsed.pose)) {
          parsed.pose = 'NATURAL_SIDES';
        }
        return parsed;
      }
    } catch {
      // Fallback
    }

    return {
      gender: 'FEMALE',
      heightInches: 65, // 5'5"
      bustInches: 36,
      waistInches: 28,
      hipInches: 38,
      shoulderInches: 15.5,
      legInches: 21,
      armAngle: 25,
      armThickness: 95,
      pose: 'NATURAL_SIDES',
      archetype: 'HOURGLASS',
      photoScanned: false,
      lastUpdated: new Date().toISOString(),
    };
  },

  saveProfile: (profile: Partial<CustomerBodyProfile>): CustomerBodyProfile => {
    const current = bodyProfileService.getProfile();
    const updated: CustomerBodyProfile = {
      ...current,
      ...profile,
      lastUpdated: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('body-profile-updated'));
    }

    return updated;
  },

  analyzeFit: (
    profile: CustomerBodyProfile,
    sizeCode: string,
    dressLengthInches: number = 48
  ): BodyFitAnalysis => {
    const isMale = profile.gender === 'MALE';
    const specsMap = isMale ? MALE_GARMENT_SPECS_BY_SIZE : GARMENT_SPECS_BY_SIZE;
    const specs = specsMap[sizeCode] || specsMap['M'];

    // 1. Calculate Ease margins
    const chestEase = specs.bust - profile.bustInches;
    const waistEase = specs.waist - profile.waistInches;
    const hipEase = specs.hips - profile.hipInches;

    const getZoneStatus = (
      zone: 'Bust' | 'Chest' | 'Waist' | 'Hips',
      body: number,
      garment: number,
      ease: number
    ): FitZoneAnalysis => {
      if (ease < 0) {
        return {
          zone,
          bodyMeasurement: body,
          garmentMeasurement: garment,
          ease,
          status: 'TIGHT',
          message: `${Math.abs(ease).toFixed(1)}" too tight (restricts movement)`,
        };
      } else if (ease <= (isMale ? 2.0 : 1.5)) {
        return {
          zone,
          bodyMeasurement: body,
          garmentMeasurement: garment,
          ease,
          status: 'SNUG',
          message: `Tailored / Form-fitting (+${ease.toFixed(1)}" ease)`,
        };
      } else {
        return {
          zone,
          bodyMeasurement: body,
          garmentMeasurement: garment,
          ease,
          status: 'COMFORTABLE',
          message: `Comfortable drape (+${ease.toFixed(1)}" ease)`,
        };
      }
    };

    const upperZoneName = isMale ? 'Chest' : 'Bust';
    const zones: FitZoneAnalysis[] = [
      getZoneStatus(upperZoneName, profile.bustInches, specs.bust, chestEase),
      getZoneStatus('Waist', profile.waistInches, specs.waist, waistEase),
      getZoneStatus('Hips', profile.hipInches, specs.hips, hipEase),
    ];

    // 2. Hemline Drop relative to height
    const shoulderToFloor = profile.heightInches * 0.82;
    const gapToFloor = shoulderToFloor - dressLengthInches;

    let hemlineLevel: BodyFitAnalysis['hemlineLevel'] = 'MID_CALF';
    let hemlineDropDescription = '';

    if (gapToFloor <= 3) {
      hemlineLevel = 'FLOOR';
      hemlineDropDescription = isMale
        ? 'Floor-skimming full length coat/kurta'
        : 'Floor-skimming gown length (covers shoes)';
    } else if (gapToFloor <= 7) {
      hemlineLevel = 'ANKLE';
      hemlineDropDescription = isMale
        ? 'Ankle-length sherwani/kurta cut'
        : 'Ankle-grazing length (ideal for heels & juttis)';
    } else if (gapToFloor <= 13) {
      hemlineLevel = 'MID_CALF';
      hemlineDropDescription = isMale
        ? 'Mid-calf traditional tunic length'
        : 'Elegant mid-calf tea length';
    } else if (gapToFloor <= 19) {
      hemlineLevel = 'KNEE';
      hemlineDropDescription = isMale
        ? 'Knee-length tailored coat/jacket'
        : 'Falls right at the knee';
    } else {
      hemlineLevel = 'ABOVE_KNEE';
      hemlineDropDescription = isMale
        ? 'Hip / thigh jacket length'
        : 'Contemporary above-the-knee silhouette';
    }

    // 3. Find optimal recommended size across all sizes
    const allSizes = Object.keys(specsMap);
    let bestSize = 'M';
    let minPenalty = 999;

    for (const s of allSizes) {
      const g = specsMap[s];
      const bE = g.bust - profile.bustInches;
      const wE = g.waist - profile.waistInches;
      const hE = g.hips - profile.hipInches;

      // Penalty calculation
      let penalty = 0;
      if (bE < 0) penalty += Math.abs(bE) * 10;
      else penalty += Math.abs(bE - 2.5);

      if (wE < 0) penalty += Math.abs(wE) * 10;
      else penalty += Math.abs(wE - 2.0);

      if (hE < 0) penalty += Math.abs(hE) * 8;
      else penalty += Math.abs(hE - 2.5);

      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestSize = s;
      }
    }

    const confidenceScore = Math.max(70, Math.min(98, Math.round(100 - minPenalty * 2)));

    return {
      recommendedSize: bestSize,
      confidenceScore,
      hemlineDropDescription,
      hemlineLevel,
      zones,
    };
  },
};
