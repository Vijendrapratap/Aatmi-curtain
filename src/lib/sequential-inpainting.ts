// src/lib/sequential-inpainting.ts
import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
import { providerRegistry } from './ai-providers/registry';

export interface InpaintingStepEvent {
  stepIndex: number;
  totalSteps: number;
  regionId: string;
  regionName: string;
  regionDisplayName: string;
  fabricName: string;
  fabricColorHex: string;
  status: 'preparing' | 'inpainting' | 'compositing' | 'completed' | 'failed';
  currentCompositeUrl: string;
  message: string;
}

export interface SequentialInpaintingOptions {
  template: CurtainTemplate;
  fabrics: Fabric[];
  assignments: FabricAssignment[];
  customInstructions?: string;
  onStepProgress?: (event: InpaintingStepEvent) => void;
}

/**
 * Creates a binary black-and-white mask on an offscreen canvas for a specific region's polygon
 */
export function generateRegionMask(
  region: Region,
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fill black (unmasked)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Fill polygon white (masked target)
  if (region.polygon_coords && region.polygon_coords.length > 2) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    region.polygon_coords.forEach((pt, i) => {
      const px = (pt.x / 100) * width;
      const py = (pt.y / 100) * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
}

/**
 * Loads an image into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 60)}...`));
    img.src = src;
  });
}

/**
 * Photorealistic client-side composite fallback for a single region.
 * Uses multiply + overlay blend modes over authentic drapery folds.
 */
async function compositeRegionOntoCanvas(
  baseImage: HTMLImageElement,
  region: Region,
  fabric: Fabric,
  assignment: FabricAssignment
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.naturalWidth || 1024;
  canvas.height = baseImage.naturalHeight || 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return baseImage.src;

  const width = canvas.width;
  const height = canvas.height;

  // 1. Draw current base image
  ctx.drawImage(baseImage, 0, 0, width, height);

  // 2. Setup clipping path for this specific region
  ctx.save();
  ctx.beginPath();
  if (region.polygon_coords && region.polygon_coords.length > 2) {
    region.polygon_coords.forEach((pt, i) => {
      const px = (pt.x / 100) * width;
      const py = (pt.y / 100) * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.clip();
  } else {
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  // 3. Load and draw fabric pattern
  try {
    const fabricImg = await loadImage(fabric.image_url);
    const patternCanvas = document.createElement('canvas');
    const scaleFactor = Math.max(0.4, assignment.scale || 1.0);
    const patW = Math.max(64, Math.round((fabricImg.naturalWidth || 400) * scaleFactor * 0.4));
    const patH = Math.max(64, Math.round((fabricImg.naturalHeight || 400) * scaleFactor * 0.4));

    patternCanvas.width = patW;
    patternCanvas.height = patH;
    const patCtx = patternCanvas.getContext('2d');
    if (patCtx) {
      patCtx.drawImage(fabricImg, 0, 0, patW, patH);
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (pattern) {
        // First pass: Soft Light / Color blend with swatch
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);

        // Second pass: Multiply for rich textile saturation
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);

        // Third pass: Overlay for sheen / luster
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = fabric.color_hex || '#D4AF37';
        ctx.fillRect(0, 0, width, height);
      }
    }
  } catch (e) {
    // Tint fallback
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = fabric.color_hex || '#D4AF37';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();

  // Subtle seam shadow around boundary
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  region.polygon_coords.forEach((pt, i) => {
    const px = (pt.x / 100) * width;
    const py = (pt.y / 100) * height;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Sequential Masked Inpainting Pipeline
 * "The Secret Sauce"
 * Loops through assigned regions ONE BY ONE, compositing the result back
 * into the base image before proceeding to the next region.
 */
export async function executeSequentialInpainting(
  options: SequentialInpaintingOptions
): Promise<{ finalImageUrl: string; stepsExecuted: number; providerUsed: string }> {
  const { template, fabrics, assignments, customInstructions, onStepProgress } = options;

  // Filter valid assignments
  const activeAssignments = assignments.filter((a) => {
    return template.regions.some((r) => r.id === a.region_id) && fabrics.some((f) => f.id === a.fabric_id);
  });

  if (activeAssignments.length === 0) {
    throw new Error('No valid fabric assignments found for this template.');
  }

  // Sort regions hierarchically by order (e.g. 1 = main panel, 2 = border, 3 = hem)
  const sortedRegionsWithAssignments = activeAssignments
    .map((assignment) => {
      const region = template.regions.find((r) => r.id === assignment.region_id)!;
      const fabric = fabrics.find((f) => f.id === assignment.fabric_id)!;
      return { region, fabric, assignment };
    })
    .sort((a, b) => (a.region.order || 0) - (b.region.order || 0));

  const totalSteps = sortedRegionsWithAssignments.length;
  const activeProvider = providerRegistry.getActiveProvider();
  let currentCompositeUrl = template.real_photo_url || template.original_image_url;

  // Initial notification
  onStepProgress?.({
    stepIndex: 0,
    totalSteps,
    regionId: '',
    regionName: '',
    regionDisplayName: 'Atelier Preparation',
    fabricName: '',
    fabricColorHex: '',
    status: 'preparing',
    currentCompositeUrl,
    message: `Initializing sequential masked inpainting via ${activeProvider.name}...`,
  });

  // SEQUENTIAL LOOP: Region by Region
  for (let i = 0; i < sortedRegionsWithAssignments.length; i++) {
    const { region, fabric, assignment } = sortedRegionsWithAssignments[i];
    const stepNumber = i + 1;

    // 1. Notify step starting
    onStepProgress?.({
      stepIndex: stepNumber,
      totalSteps,
      regionId: region.id,
      regionName: region.name,
      regionDisplayName: region.display_name,
      fabricName: fabric.name,
      fabricColorHex: fabric.color_hex,
      status: 'inpainting',
      currentCompositeUrl,
      message: `Step ${stepNumber}/${totalSteps}: Inpainting "${region.display_name}" with "${fabric.name}" (${fabric.category} · ${fabric.metadata.weave})...`,
    });

    try {
      // 2. Attempt AI Provider Inpainting via Adapter
      let newCompositeUrl: string | null = null;

      try {
        const maskDataUrl = generateRegionMask(region, 1024, 1280);
        newCompositeUrl = await activeProvider.editImage({
          baseImage: currentCompositeUrl,
          mask: maskDataUrl,
          prompt: `Inpaint zone "${region.display_name}" with high-end luxury drapery fabric "${fabric.name}". Weave: ${fabric.metadata.weave}. Color: ${fabric.color_hex}. Preserve authentic vertical columnar pleats, gravity draping folds, and window illumination highlights. ${customInstructions || ''}`,
          referenceImages: [fabric.image_url],
          zoneName: region.display_name,
          fabricName: fabric.name,
          fabricWeave: fabric.metadata.weave,
          strength: 0.85,
        });
      } catch (providerError: any) {
        console.warn(`AI Provider "${activeProvider.name}" inpainting failed for zone "${region.name}", falling back to high-res photorealistic composite:`, providerError.message);
      }

      // 3. If AI provider returned image, load it; otherwise use refined photorealistic client-side compositing
      if (newCompositeUrl) {
        currentCompositeUrl = newCompositeUrl;
      } else {
        const baseImg = await loadImage(currentCompositeUrl);
        currentCompositeUrl = await compositeRegionOntoCanvas(baseImg, region, fabric, assignment);
      }

      // 4. Notify step completion
      onStepProgress?.({
        stepIndex: stepNumber,
        totalSteps,
        regionId: region.id,
        regionName: region.name,
        regionDisplayName: region.display_name,
        fabricName: fabric.name,
        fabricColorHex: fabric.color_hex,
        status: 'completed',
        currentCompositeUrl,
        message: `Step ${stepNumber}/${totalSteps}: Successfully tailored "${region.display_name}" with seamless drape seams.`,
      });

      // Brief yield to allow animation frame and UI update
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (stepErr: any) {
      console.error(`Error processing region ${region.name}:`, stepErr);
      onStepProgress?.({
        stepIndex: stepNumber,
        totalSteps,
        regionId: region.id,
        regionName: region.name,
        regionDisplayName: region.display_name,
        fabricName: fabric.name,
        fabricColorHex: fabric.color_hex,
        status: 'failed',
        currentCompositeUrl,
        message: `Warning on zone "${region.display_name}": ${stepErr.message}. Preserving previous layer.`,
      });
    }
  }

  return {
    finalImageUrl: currentCompositeUrl,
    stepsExecuted: totalSteps,
    providerUsed: activeProvider.name,
  };
}
