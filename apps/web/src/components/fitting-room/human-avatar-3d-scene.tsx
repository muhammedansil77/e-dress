'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CustomerBodyProfile, BodyFitAnalysis, AvatarPose, AVATAR_POSES } from '../../services/body-profile.service';
import { RotateCw, Eye, Sparkles, Layers, User, Shield } from 'lucide-react';

export interface SkinTone {
  id: string;
  name: string;
  hex: string;
  roughness: number;
}

export const SKIN_TONES: SkinTone[] = [
  { id: 'natural', name: 'Realistic Human', hex: '#EAC8B1', roughness: 0.55 },
  { id: 'porcelain', name: 'Porcelain Atelier', hex: '#F5F3EF', roughness: 0.35 },
  { id: 'ivory', name: 'Warm Ivory', hex: '#EED0B5', roughness: 0.45 },
  { id: 'tan', name: 'Honey Tan', hex: '#C99E75', roughness: 0.50 },
  { id: 'bronze', name: 'Warm Bronze', hex: '#9E6C4A', roughness: 0.52 },
];

interface HumanAvatar3DSceneProps {
  profile: CustomerBodyProfile;
  fitAnalysis: BodyFitAnalysis;
  selectedSize: string;
  dressName: string;
  dressColorHex?: string;
  dressLengthInches?: number;
  selectedSkinTone: SkinTone;
  viewMode: 'body' | 'dress' | 'heatmap';
  onUpdateProfile?: (profileUpdate: Partial<CustomerBodyProfile>) => void;
}

export const HumanAvatar3DScene: React.FC<HumanAvatar3DSceneProps> = ({
  profile,
  fitAnalysis,
  dressColorHex = '#5A3E2B',
  dressLengthInches = 48,
  selectedSkinTone,
  viewMode,
  onUpdateProfile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const autoRotateRef = useRef(false);

  autoRotateRef.current = isAutoRotating;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = null;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.96, 3.2);
    camera.lookAt(0, 0.88, 0);

    // 2. High-Quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.6);
    keyLight.position.set(2.5, 4.5, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.4);
    fillLight.position.set(-3, 2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    rimLight.position.set(-2, 3.5, -3);
    scene.add(rimLight);

    // 4. Root Group & Circular Studio Pedestal
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    modelGroupRef.current = rootGroup;

    // Floor Contact Shadow
    const floorGeometry = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 110);
      grad.addColorStop(0, 'rgba(47, 36, 29, 0.45)');
      grad.addColorStop(0.5, 'rgba(47, 36, 29, 0.18)');
      grad.addColorStop(1, 'rgba(47, 36, 29, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const floorMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    scene.add(floorMesh);

    // Sleek Circular Studio Pedestal
    const pedestalGeom = new THREE.CylinderGeometry(0.36, 0.38, 0.03, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x221D1A,
      roughness: 0.35,
      metalness: 0.3,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestalMesh.position.set(0, 0.015, 0);
    pedestalMesh.receiveShadow = true;
    rootGroup.add(pedestalMesh);

    // 5. Load the Real Sculpted Human Male Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/custom_human.glb',
      (gltf) => {
        if (isCancelled) return;
        setIsLoadingModel(false);

        const avatar = gltf.scene;

        // 1. Biometric Parameters & Ratios (relative to base 40" chest, 19.5" shoulder, 32" waist)
        const isMale = profile.gender === 'MALE';
        const baseHeight = isMale ? 70 : 65;
        const heightScale = profile.heightInches / baseHeight;

        const shoulderInches = profile.shoulderInches || (isMale ? 18.0 : 15.5);
        const shoulderFactor = shoulderInches / (isMale ? 19.5 : 15.5);
        const chestFactor = profile.bustInches / (isMale ? 40.0 : 36.0);
        const waistFactor = profile.waistInches / (isMale ? 32.0 : 27.0);
        const hipFactor = profile.hipInches / (isMale ? 38.0 : 37.0);

        // Leg Slimming vs Bulking factor (18.5" slender vs 25.5" muscular quads)
        const defaultLegInches = isMale
          ? (profile.archetype === 'SKINNY_SLENDER' ? 18.5 : profile.archetype === 'BROAD_CHEST' ? 25.5 : 22.0)
          : (profile.archetype === 'PETITE' ? 19.0 : profile.archetype === 'PEAR' ? 23.5 : 21.0);
        const legInches = profile.legInches || defaultLegInches;
        const baseLegInches = isMale ? 22.0 : 21.0;
        const legFactor = legInches / baseLegInches;

        // Hand & Arm Stance Posture (0: resting at sides / photo match, 100: open A-pose)
        const defaultArmAngle = profile.archetype === 'SKINNY_SLENDER' ? 10 : isMale ? 25 : 20;
        const armAngle = profile.armAngle !== undefined ? profile.armAngle : defaultArmAngle;

        // Hand & Arm Build Thickness (70%: slender/skinny hands & wrists, 130%: muscular hands & forearms)
        const defaultArmThickness = profile.archetype === 'SKINNY_SLENDER' ? 76 : 100;
        const armThicknessParam = profile.armThickness !== undefined ? profile.armThickness : defaultArmThickness;

        // Active Pose
        const activePose: AvatarPose = profile.pose || 'NATURAL_SIDES';

        // 2. Exact Anatomical Vertex Morphing (Chest pecs, Deltoids, Clavicles, Waist, Arms, Legs, Poses)
        avatar.traverse((child: any) => {
          if (child.isMesh && child.geometry && child.geometry.attributes.position) {
            const pos = child.geometry.attributes.position;
            // Cache pristine base model vertices to prevent compounding distortion on re-renders
            if (!child.geometry.userData.origPositions) {
              child.geometry.userData.origPositions = Float32Array.from(pos.array);
            }
            const orig = child.geometry.userData.origPositions;

            for (let i = 0; i < pos.count; i++) {
              let x = orig[i * 3];
              let y = orig[i * 3 + 1];
              let z = orig[i * 3 + 2];
              const absX = Math.abs(x);

              // 1. POSE SHIFT ON TORSO & SPINE (Dynamic Runway Contours)
              if (activePose === 'FASHION_RUNWAY' && y >= 85 && y <= 152 && absX < 21) {
                const twist = -0.04 * Math.sin(((y - 85) / 67) * Math.PI);
                const cosT = Math.cos(twist), sinT = Math.sin(twist);
                const nx = x * cosT - z * sinT;
                const nz = x * sinT + z * cosT;
                x = nx;
                z = nz;
              }

              // A. CHEST & PECTORAL MORPHING (Y between 120 and 144, |X| < 21)
              if (y >= 120 && y <= 144 && absX < 21) {
                const chestYWeight = 1.0 - Math.abs(y - 131) / 13.0;
                if (chestYWeight > 0) {
                  // Lateral ribcage breadth
                  const widthMorph = 1.0 + (chestFactor - 1.0) * chestYWeight * 0.75;
                  x *= widthMorph;

                  // Pectoral anterior fullness (Z > 0)
                  if (z > 0) {
                    // When chestFactor is low (e.g. 33" = 0.825), pecs flatten naturally
                    const pecDepthMorph = 1.0 + (chestFactor - 1.0) * chestYWeight * 1.25;
                    z *= Math.max(0.55, pecDepthMorph);
                  } else {
                    // Latissimus dorsi breadth
                    z *= (1.0 + (chestFactor - 1.0) * chestYWeight * 0.35);
                  }
                }
              }

              // B. NATURAL WAIST TAPER (Y between 96 and 120, |X| < 21)
              if (y >= 96 && y <= 120 && absX < 21) {
                const waistYWeight = 1.0 - Math.abs(y - 108) / 12.0;
                if (waistYWeight > 0) {
                  const waistWidthMorph = 1.0 + (waistFactor - 1.0) * waistYWeight * 0.85;
                  x *= waistWidthMorph;
                  const waistDepthMorph = 1.0 + (waistFactor - 1.0) * waistYWeight * 0.85;
                  z *= waistDepthMorph;
                }
              }

              // C. SHOULDERS & DELTOIDS (Torso/Clavicle: Y between 136 and 154, |X| between 8.5 and 21)
              if (y >= 136 && y <= 154 && absX >= 8.5 && absX < 21.0) {
                const clavicleWeight = Math.min(1.0, Math.max(0.0, (absX - 8.5) / 10.5));
                x *= 1.0 + (shoulderFactor - 1.0) * clavicleWeight * 0.90;

                // For lean/slender frames (shoulderFactor < 1.0), soften deltoid bulk and slope shoulders
                if (shoulderFactor < 1.0 && absX >= 12.5) {
                  const deltoidRelief = (1.0 - shoulderFactor) * 0.55;
                  y -= (absX - 12.5) * deltoidRelief * 0.18;
                  z *= (1.0 - deltoidRelief * 0.40);
                }
              }

              // D. LEGS: THIGHS, KNEES & CALVES SLIMMING / BULKING + POSE STRIDE (Y between 8 and 86, |X| < 21)
              if (y >= 8.0 && y <= 86.0 && absX < 21.0) {
                const footWeight = Math.min(1.0, Math.max(0.0, (y - 8.0) / 8.0));
                const hipWeight = Math.min(1.0, Math.max(0.0, (86.0 - y) / 6.0));
                const legBlend = footWeight * hipWeight;

                if (legBlend > 0) {
                  const currentLegFactor = 1.0 + (legFactor - 1.0) * legBlend;
                  const sign = x >= 0 ? 1 : -1;
                  const legCenterX = sign * 9.2 * Math.max(0.85, Math.min(1.15, hipFactor));
                  const legCenterZ = y > 45 ? 1.5 : 0.0;

                  const dx = x - legCenterX;
                  const dz = z - legCenterZ;

                  x = legCenterX + dx * currentLegFactor;
                  z = legCenterZ + dz * currentLegFactor;
                }

                // Pose Leg Stride for Runway
                if (activePose === 'FASHION_RUNWAY') {
                  const legT = Math.min(1.0, (86.0 - y) / 60.0);
                  if (x > 0) z += legT * 2.8;
                  else z -= legT * 2.5;
                }
              }

              // E. ARMS & HANDS: Robust Symmetric Kinematics Across All Poses
              const dynamicShoulderX = 18.5 * (1.0 + (shoulderFactor - 1.0) * 0.90);
              const hipOuterX = 18.0 * hipFactor;
              const userArmThickness = (armThicknessParam / 100);
              const effectiveArmThickness = Math.max(0.68, Math.min(1.32, 0.5 * (shoulderFactor + 1.0) * userArmThickness));

              // Determine target angle based on active pose
              let targetAngle = -1.18; // default ~67.6 deg
              if (activePose === 'OPEN_A_POSE') {
                targetAngle = -0.80; // ~45.8 deg wide open for 360 inspection
              } else if (activePose === 'RELAXED_STANCE') {
                targetAngle = -1.02; // ~58.4 deg relaxed low
              } else if (activePose === 'TAILORED_FIT') {
                targetAngle = -1.26; // ~72.2 deg close tailored
              } else if (activePose === 'FASHION_RUNWAY') {
                targetAngle = -1.18;
              } else {
                // NATURAL_SIDES: driven by armAngle slider (0 = close to thighs, 100 = open)
                const stanceT = armAngle / 100;
                targetAngle = -1.24 + stanceT * 0.40;
              }

              // Left Arm (x > 18.5)
              if (x > 18.5 && y > 75 && y < 165) {
                const dx = x - 18.5;
                const dy = y - 142.0;
                const w = Math.min(1.0, Math.max(0.0, (dx - 0.5) / 4.0));
                const angle = (activePose === 'FASHION_RUNWAY' ? -1.22 : targetAngle) * w;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                let rx = dx * cosA - dy * sinA;
                let ry = dx * sinA + dy * cosA;

                const clearanceShift = Math.max(0.0, (hipOuterX + 2.0) - (dynamicShoulderX + rx * effectiveArmThickness));
                const handProgress = Math.min(1.0, Math.max(0.0, (dx - 22.0) / 38.0));
                rx += (clearanceShift / effectiveArmThickness) * handProgress;

                let finalZ = z * effectiveArmThickness - 1.2 * w;
                if (activePose === 'FASHION_RUNWAY') {
                  finalZ -= 2.2 * handProgress; // left arm swings back slightly
                }

                pos.setXYZ(
                  i,
                  dynamicShoulderX + rx * effectiveArmThickness,
                  142.0 + ry,
                  finalZ
                );
              }
              // Right Arm (x < -18.5)
              else if (x < -18.5 && y > 75 && y < 165) {
                const dx = -x - 18.5; // positive distance outward along right arm
                const dy = y - 142.0;
                const w = Math.min(1.0, Math.max(0.0, (dx - 0.5) / 4.0));
                const angle = (activePose === 'FASHION_RUNWAY' ? -1.14 : targetAngle) * w;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                let rx = dx * cosA - dy * sinA;
                let ry = dx * sinA + dy * cosA;

                const clearanceShift = Math.max(0.0, (hipOuterX + 2.0) - (dynamicShoulderX + rx * effectiveArmThickness));
                const handProgress = Math.min(1.0, Math.max(0.0, (dx - 22.0) / 38.0));
                rx += (clearanceShift / effectiveArmThickness) * handProgress;

                let finalZ = z * effectiveArmThickness - 1.2 * w;
                if (activePose === 'FASHION_RUNWAY') {
                  finalZ += 2.2 * handProgress; // right arm swings forward slightly
                }

                pos.setXYZ(
                  i,
                  -(dynamicShoulderX + rx * effectiveArmThickness),
                  142.0 + ry,
                  finalZ
                );
              } else {
                pos.setXYZ(i, x, y, z);
              }
            }

            pos.needsUpdate = true;
            child.geometry.computeVertexNormals();
          }
        });

        // 3. Compute Bounding Box and Normalize Model Height
        const box = new THREE.Box3().setFromObject(avatar);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Normalize model to standard human height (1.75m) and stand on pedestal (Y = 0.03)
        const targetHeight = 1.72 * heightScale;
        const scaleFactor = targetHeight / (size.y || 180);

        avatar.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Recompute position to sit perfectly on pedestal
        const scaledBox = new THREE.Box3().setFromObject(avatar);
        avatar.position.x = -scaledBox.getCenter(new THREE.Vector3()).x;
        avatar.position.y = 0.03 - scaledBox.min.y;
        avatar.position.z = -scaledBox.getCenter(new THREE.Vector3()).z;

        // 3. Fix Eyes & Materials
        avatar.traverse((child: any) => {
          // Hide occlusion and tear line meshes that render as solid white over eyeballs
          if (
            child.name.includes('EyeOcclusion') ||
            child.name.includes('TearLine') ||
            child.name.includes('Tongue')
          ) {
            child.visible = false;
          }

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enhance eye material
            if (child.name.includes('Eye') && child.material) {
              child.material.roughness = 0.12;
              child.material.metalness = 0.05;
            }

            // If user selects porcelain / skin tone swatch, tint the material
            if (selectedSkinTone.id === 'porcelain') {
              child.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xF5F3EF),
                roughness: 0.35,
                metalness: 0.02,
                clearcoat: 0.12,
              });
            } else if (
              selectedSkinTone.id !== 'natural' &&
              child.material &&
              child.material.color &&
              !child.name.includes('Eye')
            ) {
              child.material.color.set(selectedSkinTone.hex);
            }
          }
        });

        rootGroup.add(avatar);

        // --- OPTIONAL FITTED STORE DRESS DRAPE ---
        const totalHeight = 1.72 * heightScale;
        const shoulderToFloor = totalHeight * 0.82;
        const garmentScale = (dressLengthInches / 48);
        const hemlineY = Math.max(0.18, 1.35 * heightScale - (shoulderToFloor * 0.72 * garmentScale));

        if (viewMode === 'dress' || viewMode === 'heatmap') {
          const dressHeight = (1.35 * heightScale) - hemlineY;
          const dressGeom = new THREE.CylinderGeometry(
            0.19 * chestFactor,
            0.26 * hipFactor * (dressHeight > 0.6 ? 1.18 : 1.05),
            dressHeight,
            32,
            1,
            true
          );
          dressGeom.scale(1.20, 1, 0.88);

          let dressColor = new THREE.Color(dressColorHex);
          if (viewMode === 'heatmap') {
            const tightCount = fitAnalysis.zones.filter((z) => z.status === 'TIGHT').length;
            const snugCount = fitAnalysis.zones.filter((z) => z.status === 'SNUG').length;
            dressColor = tightCount > 0 ? new THREE.Color('#e11d48') : snugCount > 0 ? new THREE.Color('#d97706') : new THREE.Color('#059669');
          }

          const dressMat = new THREE.MeshStandardMaterial({
            color: dressColor,
            roughness: 0.38,
            metalness: 0.12,
            side: THREE.DoubleSide,
            transparent: viewMode === 'heatmap',
            opacity: viewMode === 'heatmap' ? 0.88 : 1.0,
          });

          const dressMesh = new THREE.Mesh(dressGeom, dressMat);
          dressMesh.position.set(0, (1.35 * heightScale) - dressHeight / 2, 0);
          dressMesh.castShadow = true;
          rootGroup.add(dressMesh);
        }

        // --- PRECISION MEASUREMENT RINGS OVER 3D BODY ---
        const getZoneColor = (zoneName: string) => {
          const z = fitAnalysis.zones.find((item) => item.zone.toLowerCase() === zoneName.toLowerCase());
          if (z?.status === 'TIGHT') return '#e11d48';
          if (z?.status === 'SNUG') return '#d97706';
          return '#059669';
        };

        const createMeasurementRing = (y: number, rx: number, rz: number, colorHex: string) => {
          const curve = new THREE.EllipseCurve(0, 0, rx, rz, 0, 2 * Math.PI, false, 0);
          const points = curve.getPoints(48);
          const lineGeom = new THREE.BufferGeometry().setFromPoints(
            points.map((p) => new THREE.Vector3(p.x, 0, p.y))
          );
          const lineMat = new THREE.LineDashedMaterial({
            color: new THREE.Color(colorHex),
            dashSize: 0.03,
            gapSize: 0.02,
            linewidth: 2,
          });
          const ring = new THREE.Line(lineGeom, lineMat);
          ring.computeLineDistances();
          ring.position.set(0, y, 0);
          return ring;
        };

        const chestRing = createMeasurementRing(1.24 * heightScale, 0.22 * chestFactor, 0.16 * chestFactor, getZoneColor(isMale ? 'Chest' : 'Bust'));
        const waistRing = createMeasurementRing(1.02 * heightScale, 0.18 * waistFactor, 0.13 * waistFactor, getZoneColor('Waist'));
        const hipRing = createMeasurementRing(0.88 * heightScale, 0.21 * hipFactor, 0.16 * hipFactor, getZoneColor('Hips'));

        rootGroup.add(chestRing);
        rootGroup.add(waistRing);
        rootGroup.add(hipRing);

        // Floating Gold Hemline Ring
        const hemlineRing = createMeasurementRing(hemlineY, 0.32, 0.26, '#B58B45');
        rootGroup.add(hemlineRing);
      },
      undefined,
      (error) => {
        console.error('Error loading custom human model:', error);
        setIsLoadingModel(false);
      }
    );

    // Initial slight angle
    rootGroup.rotation.y = 0.15;

    // 6. 360° Drag-to-Rotate Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      modelGroupRef.current.rotation.y += deltaX * 0.012;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      modelGroupRef.current.rotation.y += deltaX * 0.014;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [profile, profile.pose, fitAnalysis, dressColorHex, dressLengthInches, selectedSkinTone, viewMode]);

  const handleResetRotation = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y = 0;
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      {/* Loading Spinner */}
      {isLoadingModel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F7F1E7]/70 backdrop-blur-xs rounded-2xl z-10">
          <div className="w-8 h-8 rounded-full border-2 border-[#5A3E2B] border-t-transparent animate-spin" />
          <span className="text-xs text-[#5A3E2B] font-semibold">Loading Anatomical Model...</span>
        </div>
      )}

      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 360° Studio Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#FAF4E8]/95 backdrop-blur-xs border border-[#DED2C2] px-2.5 py-1 rounded-full text-[11px] text-[#5A3E2B] font-medium shadow-xs pointer-events-auto">
          <RotateCw className="w-3 h-3 text-[#B58B45]" />
          <span>Drag 360°</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shadow-xs ${
              isAutoRotating
                ? 'bg-[#5A3E2B] text-[#FFFDF8] border-[#5A3E2B]'
                : 'bg-[#FAF4E8]/95 text-[#5A3E2B] border-[#DED2C2] hover:border-[#5A3E2B]'
            }`}
          >
            {isAutoRotating ? 'Pause' : 'Auto Spin'}
          </button>

          <button
            type="button"
            onClick={handleResetRotation}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF4E8]/95 text-[#5A3E2B] border border-[#DED2C2] hover:border-[#5A3E2B] transition-all shadow-xs"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
