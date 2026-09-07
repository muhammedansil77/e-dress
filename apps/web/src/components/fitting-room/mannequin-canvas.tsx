'use client';

import React from 'react';
import { CustomerBodyProfile, BodyFitAnalysis } from '../../services/body-profile.service';
import { Sparkles, Ruler, Shield } from 'lucide-react';

interface MannequinCanvasProps {
  profile: CustomerBodyProfile;
  fitAnalysis: BodyFitAnalysis;
  selectedSize: string;
  dressName: string;
  dressColorHex?: string;
  dressLengthInches?: number;
}

export const MannequinCanvas: React.FC<MannequinCanvasProps> = ({
  profile,
  fitAnalysis,
  selectedSize,
  dressName,
  dressColorHex = '#5A3E2B',
  dressLengthInches = 48,
}) => {
  const isMale = profile.gender === 'MALE';

  // Base normalization
  const baseHeight = isMale ? 70 : 65; // 5'10" for male, 5'5" for female
  const heightRatio = profile.heightInches / baseHeight;

  // Anatomical proportions based on gender
  const shoulderWidth = isMale
    ? 60 + ((profile.shoulderInches || 19) - 19) * 2.5
    : 44 + (profile.bustInches - 36) * 0.6;

  const chestWidth = isMale
    ? 52 + (profile.bustInches - 40) * 1.5
    : 46 + (profile.bustInches - 36) * 1.6;

  const waistWidth = isMale
    ? 38 + (profile.waistInches - 32) * 1.4
    : 29 + (profile.waistInches - 27) * 1.6;

  const hipWidth = isMale
    ? 44 + (profile.hipInches - 38) * 1.2
    : 52 + (profile.hipInches - 37) * 1.7;

  // Vertical landmark heights
  const headTopY = 32;
  const chinY = 94;
  const neckY = 112;
  const shoulderY = 126;
  const chestY = isMale ? 175 : 168;
  const waistY = 228;
  const hipY = 286;
  const crotchY = 330;
  const kneeY = 440 * heightRatio;
  const ankleY = 540 * heightRatio;

  // Garment hemline drop
  const shoulderToFloor = profile.heightInches * 0.82;
  const garmentLengthActual = dressLengthInches;
  const garmentScale = 7.1 * (baseHeight / profile.heightInches);
  const garmentDrop = Math.min(ankleY + 18, shoulderY + garmentLengthActual * garmentScale);

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
    <div className="relative bg-gradient-to-b from-[#FFFDF8] via-[#FDFBF7] to-[#F7F1E7] rounded-3xl border border-[#DED2C2] p-4 flex flex-col items-center justify-between shadow-xs overflow-hidden select-none">
      {/* 1. Top Badges: Silhouette & Fit Score */}
      <div className="w-full flex items-center justify-between z-10 text-xs gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE5D5] text-[#5A3E2B] font-semibold text-[11px] shadow-2xs">
          <Ruler className="w-3.5 h-3.5 text-[#B58B45]" />
          <span>
            {Math.floor(profile.heightInches / 12)}'{profile.heightInches % 12}" • {isMale ? 'Tailored' : 'Couture'} {profile.archetype.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] font-bold text-[11px] shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#059669]" />
          <span>{fitAnalysis.confidenceScore}% Match ({selectedSize})</span>
        </div>
      </div>

      {/* 2. Studio 3D Mannequin Canvas */}
      <div className="w-full max-w-[300px] aspect-[1/2] relative my-1">
        <svg
          viewBox="0 0 320 600"
          className="w-full h-full filter drop-shadow-md transition-all duration-300"
        >
          <defs>
            {/* Studio Ceramic Mannequin Gradient (Shaded 3D Volume) */}
            <linearGradient id="studioMannequin" x1="20%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF4E8" />
              <stop offset="35%" stopColor="#EFE5D5" />
              <stop offset="70%" stopColor="#DED2C2" />
              <stop offset="100%" stopColor="#BFAF9B" />
            </linearGradient>

            {/* Deltoid / Arm Shading Gradient */}
            <linearGradient id="armShading" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DED2C2" />
              <stop offset="50%" stopColor="#EFE5D5" />
              <stop offset="100%" stopColor="#C8BAA6" />
            </linearGradient>

            {/* Garment Luxury Fabric Luster Gradient */}
            <linearGradient id="garmentFabric" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={dressColorHex} stopOpacity="0.82" />
              <stop offset="35%" stopColor={dressColorHex} stopOpacity="1" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="70%" stopColor={dressColorHex} stopOpacity="0.95" />
              <stop offset="100%" stopColor={dressColorHex} stopOpacity="0.80" />
            </linearGradient>

            {/* Brushed Brass / Gold Pedestal Stand */}
            <linearGradient id="pedestalGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A6424" />
              <stop offset="30%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F9E8B2" />
              <stop offset="70%" stopColor="#B58B45" />
              <stop offset="100%" stopColor="#5A3E2B" />
            </linearGradient>

            {/* Soft Ambient Shadow */}
            <radialGradient id="pedestalShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2F241D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2F241D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* --- Floor Pedestal Stand (Studio Furniture) --- */}
          <g id="atelierPedestal">
            {/* Cast Floor Drop Shadow */}
            <ellipse cx="160" cy="582" rx="76" ry="10" fill="url(#pedestalShadow)" />

            {/* Brushed Brass Circular Base */}
            <ellipse cx="160" cy="578" rx="64" ry="7" fill="url(#pedestalGold)" />
            <ellipse cx="160" cy="576" rx="58" ry="5.5" fill="#E8D5B5" opacity="0.6" />

            {/* Vertical Studio Support Rod */}
            <rect x="157.5" y="320" width="5" height="258" fill="url(#pedestalGold)" />
          </g>

          {/* --- 3D Anatomical Mannequin Body --- */}
          <g id="sculptedAnatomy">
            {/* Sculpted Head */}
            <path
              d={`
                M 160 ${headTopY}
                C 178 ${headTopY} 186 ${headTopY + 16} 184 ${headTopY + 38}
                C 182 ${headTopY + 54} 172 ${chinY - 2} 160 ${chinY}
                C 148 ${chinY - 2} 138 ${headTopY + 54} 136 ${headTopY + 38}
                C 134 ${headTopY + 16} 142 ${headTopY} 160 ${headTopY}
                Z
              `}
              fill="url(#studioMannequin)"
              stroke="#DED2C2"
              strokeWidth="1"
            />

            {/* Sculpted Neck & Sternocleidomastoid Curves */}
            <path
              d={`
                M ${isMale ? 149 : 152} ${chinY - 4}
                L ${isMale ? 147 : 151} ${neckY}
                L ${isMale ? 173 : 169} ${neckY}
                L ${isMale ? 171 : 168} ${chinY - 4}
                Z
              `}
              fill="url(#studioMannequin)"
            />

            {/* Clavicle / Collarbone Accent Lines */}
            <path
              d={`
                M ${160 - shoulderWidth + 14} ${shoulderY}
                Q 160 ${shoulderY + 6} ${160 + shoulderWidth - 14} ${shoulderY}
              `}
              stroke="#BFAF9B"
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            />

            {/* Left Arm & Deltoid Cap */}
            <path
              d={`
                M ${160 - shoulderWidth} ${shoulderY}
                C ${160 - shoulderWidth - 16} ${shoulderY + 10} ${160 - shoulderWidth - 22} ${chestY} ${160 - shoulderWidth - 18} 240
                Q ${160 - shoulderWidth - 14} 300 ${160 - shoulderWidth - 8} 345
              `}
              stroke="url(#armShading)"
              strokeWidth={isMale ? '16' : '12'}
              strokeLinecap="round"
              fill="none"
            />

            {/* Right Arm & Deltoid Cap */}
            <path
              d={`
                M ${160 + shoulderWidth} ${shoulderY}
                C ${160 + shoulderWidth + 16} ${shoulderY + 10} ${160 + shoulderWidth + 22} ${chestY} ${160 + shoulderWidth + 18} 240
                Q ${160 + shoulderWidth + 14} 300 ${160 + shoulderWidth + 8} 345
              `}
              stroke="url(#armShading)"
              strokeWidth={isMale ? '16' : '12'}
              strokeLinecap="round"
              fill="none"
            />

            {/* Main Torso & Pelvis Contour (3D Sculpted) */}
            <path
              d={`
                M ${160 - shoulderWidth} ${shoulderY}
                C ${160 - chestWidth} ${chestY - 14}, ${160 - chestWidth} ${chestY + 12}, ${160 - waistWidth} ${waistY}
                C ${160 - waistWidth} ${waistY + 18}, ${160 - hipWidth} ${hipY - 8}, ${160 - hipWidth} ${hipY + 18}
                C ${160 - hipWidth} ${hipY + 30}, 144 ${crotchY - 8}, 144 ${crotchY}
                L 176 ${crotchY}
                C 176 ${crotchY - 8}, ${160 + hipWidth} ${hipY + 30}, ${160 + hipWidth} ${hipY + 18}
                C ${160 + hipWidth} ${hipY - 8}, ${160 + waistWidth} ${waistY + 18}, ${160 + waistWidth} ${waistY}
                C ${160 + chestWidth} ${chestY + 12}, ${160 + chestWidth} ${chestY - 14}, ${160 + shoulderWidth} ${shoulderY}
                Z
              `}
              fill="url(#studioMannequin)"
              stroke="#DED2C2"
              strokeWidth="1.2"
            />

            {/* Left Leg (Thigh, Knee, Calf, Ankle) */}
            <path
              d={`
                M 144 ${crotchY}
                Q 141 ${kneeY} 142 ${ankleY}
                L 138 ${ankleY + 14}
              `}
              stroke="url(#studioMannequin)"
              strokeWidth={isMale ? '24' : '18'}
              strokeLinecap="round"
              fill="none"
            />

            {/* Right Leg */}
            <path
              d={`
                M 176 ${crotchY}
                Q 179 ${kneeY} 178 ${ankleY}
                L 182 ${ankleY + 14}
              `}
              stroke="url(#studioMannequin)"
              strokeWidth={isMale ? '24' : '18'}
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* --- Dimensional Fabric Drape Overlay --- */}
          <g id="garmentDrapeLayer">
            {isMale ? (
              /* Male Tailored Silhouette (Structured Blazer / Kurta Drape) */
              <g id="tailoredMenJacket">
                <path
                  d={`
                    M ${160 - shoulderWidth + 2} ${shoulderY + 2}
                    C ${160 - chestWidth - 3} ${chestY}, ${160 - waistWidth - 4} ${waistY}, ${160 - hipWidth - 4} ${hipY}
                    L ${160 - hipWidth - 8} ${garmentDrop}
                    Q 160 ${garmentDrop + 4} ${160 + hipWidth + 8} ${garmentDrop}
                    L ${160 + hipWidth + 4} ${hipY}
                    C ${160 + waistWidth + 4} ${waistY}, ${160 + chestWidth + 3} ${chestY}, ${160 + shoulderWidth - 2} ${shoulderY + 2}
                    L 170 ${shoulderY + 16}
                    L 160 ${waistY - 10}
                    L 150 ${shoulderY + 16}
                    Z
                  `}
                  fill="url(#garmentFabric)"
                  stroke="#B58B45"
                  strokeWidth="1.8"
                />

                {/* Tailored Lapel Creases */}
                <path
                  d={`
                    M 150 ${shoulderY + 16} L 160 ${waistY - 10}
                    M 170 ${shoulderY + 16} L 160 ${waistY - 10}
                    M 160 ${waistY - 10} L 160 ${garmentDrop}
                  `}
                  stroke="#E8D5B5"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                  fill="none"
                />
              </g>
            ) : (
              /* Female Couture Dress Drape with Gathered Waist & Wave Hem */
              <g id="coutureFemaleDress">
                <path
                  d={`
                    M ${160 - shoulderWidth + 10} ${shoulderY + 8}
                    C ${160 - chestWidth - 2} ${chestY}, ${160 - waistWidth - 2} ${waistY}, ${160 - hipWidth - 3} ${hipY}
                    Q ${160 - hipWidth - 18} ${(hipY + garmentDrop) / 2} ${160 - hipWidth - 24} ${garmentDrop}
                    C ${160 - hipWidth / 2} ${garmentDrop + 6}, ${160 + hipWidth / 2} ${garmentDrop - 4}, ${160 + hipWidth + 24} ${garmentDrop}
                    Q ${160 + hipWidth + 18} ${(hipY + garmentDrop) / 2} ${160 + hipWidth + 3} ${hipY}
                    C ${160 + waistWidth + 2} ${waistY}, ${160 + chestWidth + 2} ${chestY}, ${160 + shoulderWidth - 10} ${shoulderY + 8}
                    L 160 ${shoulderY + 32}
                    Z
                  `}
                  fill="url(#garmentFabric)"
                  stroke="#B58B45"
                  strokeWidth="1.6"
                />

                {/* Natural Fabric Drape Fold Shadows (Silk/Georgette Gathering) */}
                <path
                  d={`
                    M ${160 - waistWidth - 2} ${waistY}
                    Q 160 ${waistY + 6} ${160 + waistWidth + 2} ${waistY}
                  `}
                  stroke="#E8D5B5"
                  strokeWidth="2.2"
                  fill="none"
                />

                {/* Vertical Fabric Flow Lines */}
                <path
                  d={`
                    M 152 ${waistY + 4} Q 148 ${(waistY + garmentDrop) / 2} 142 ${garmentDrop - 2}
                    M 168 ${waistY + 4} Q 172 ${(waistY + garmentDrop) / 2} 178 ${garmentDrop - 2}
                  `}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.3"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* --- Precision Fit Tension Zones (Left Column) --- */}
          {/* 1. Upper Body (Bust / Chest) Marker */}
          <g id="upperZoneMarker">
            <circle cx={160 - chestWidth - 10} cy={chestY} r="5.5" fill={getStatusColor(upperZone?.status)} />
            <circle cx={160 - chestWidth - 10} cy={chestY} r="8" fill="none" stroke={getStatusColor(upperZone?.status)} strokeWidth="1" opacity="0.6" />
            <line
              x1={160 - chestWidth - 15}
              y1={chestY}
              x2="52"
              y2={chestY}
              stroke={getStatusColor(upperZone?.status)}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text x="46" y={chestY + 3.5} textAnchor="end" fontSize="10" fontWeight="bold" fill={getStatusColor(upperZone?.status)}>
              {isMale ? 'Chest' : 'Bust'}
            </text>
          </g>

          {/* 2. Waist Marker */}
          <g id="waistZoneMarker">
            <circle cx={160 - waistWidth - 10} cy={waistY} r="5.5" fill={getStatusColor(waistZone?.status)} />
            <circle cx={160 - waistWidth - 10} cy={waistY} r="8" fill="none" stroke={getStatusColor(waistZone?.status)} strokeWidth="1" opacity="0.6" />
            <line
              x1={160 - waistWidth - 15}
              y1={waistY}
              x2="52"
              y2={waistY}
              stroke={getStatusColor(waistZone?.status)}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text x="46" y={waistY + 3.5} textAnchor="end" fontSize="10" fontWeight="bold" fill={getStatusColor(waistZone?.status)}>
              Waist
            </text>
          </g>

          {/* 3. Hips Marker */}
          <g id="hipZoneMarker">
            <circle cx={160 - hipWidth - 10} cy={hipY} r="5.5" fill={getStatusColor(hipZone?.status)} />
            <circle cx={160 - hipWidth - 10} cy={hipY} r="8" fill="none" stroke={getStatusColor(hipZone?.status)} strokeWidth="1" opacity="0.6" />
            <line
              x1={160 - hipWidth - 15}
              y1={hipY}
              x2="52"
              y2={hipY}
              stroke={getStatusColor(hipZone?.status)}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text x="46" y={hipY + 3.5} textAnchor="end" fontSize="10" fontWeight="bold" fill={getStatusColor(hipZone?.status)}>
              Hips
            </text>
          </g>

          {/* --- Hemline Level Indicator (Right Column) --- */}
          <g id="hemlineDropMarker">
            <line
              x1="240"
              y1={garmentDrop}
              x2="280"
              y2={garmentDrop}
              stroke="#B58B45"
              strokeWidth="1.8"
            />
            <circle cx="280" cy={garmentDrop} r="3.5" fill="#B58B45" />
            <text x="278" y={garmentDrop - 5} textAnchor="end" fontSize="9" fontWeight="bold" fill="#5A3E2B">
              Hemline ({fitAnalysis.hemlineLevel})
            </text>
          </g>
        </svg>
      </div>

      {/* 3. Bottom Description Card */}
      <div className="w-full bg-[#FAF4E8] rounded-xl border border-[#DED2C2] p-2.5 text-center text-xs">
        <p className="font-semibold text-[#5A3E2B]">
          {fitAnalysis.hemlineDropDescription}
        </p>
      </div>
    </div>
  );
};
