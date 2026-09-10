import { Region, CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';
import { loadImage, rasterizeToPngBase64, getTemplateRealPhotoUrl } from './fabricRenderer';

/**
 * Solid distinctive tint colors for guiding inpainting models per region order
 */
export const REGION_TINTS = [
  '#00FF88', // Electric Emerald
  '#FF0077', // Hot Magenta
  '#00DDFF', // Vivid Cyan
  '#FFAA00', // Deep Amber
  '#B800FF', // Neon Violet
  '#FF3300', // Radiant Vermilion
];

/**
 * Renders a crisp binary mask (white = region interior, black = background)
 * on an offscreen HTMLCanvasElement matching the target dimensions.
 */
export function createRegionMaskCanvas(
  region: Region,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Solid black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const coords = region.polygon_coords;
  if (coords && coords.length >= 3) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo((coords[0].x / 100) * width, (coords[0].y / 100) * height);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo((coords[i].x / 100) * width, (coords[i].y / 100) * height);
    }
    ctx.closePath();
    ctx.fill();
  }

  return canvas;
}

/**
 * Creates a visual guidance plate where the target region is highlighted
 * with a translucent neon tint overlay, while the rest of the room stays authentic.
 */
export function createTintedGuidanceCanvas(
  baseImage: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  tintColor: string,
  alpha = 0.55
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw base photo
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  // 2. Overlay colored tint masked strictly to the region
  const tintCanvas = document.createElement('canvas');
  tintCanvas.width = canvas.width;
  tintCanvas.height = canvas.height;
  const tCtx = tintCanvas.getContext('2d');
  if (tCtx) {
    tCtx.fillStyle = tintColor;
    tCtx.fillRect(0, 0, canvas.width, canvas.height);
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(maskCanvas, 0, 0);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(tintCanvas, 0, 0);
    ctx.restore();
  }

  return canvas;
}

/**
 * Performs client-side feathered alpha compositing:
 * Keeps 100% of the original base photo pixels outside the mask,
 * and seamlessly blends the generative AI edit inside the zone
 * using a softly feathered boundary to eliminate halos or hard seams.
 */
export function featheredComposite(
  baseImage: HTMLImageElement | HTMLCanvasElement,
  editedImage: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  featherRadius = 4
): string {
  const width = baseImage.width;
  const height = baseImage.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Draw 100% pristine original background
  ctx.drawImage(baseImage, 0, 0, width, height);

  // 2. Prepare feathered mask
  const featheredMask = document.createElement('canvas');
  featheredMask.width = width;
  featheredMask.height = height;
  const fCtx = featheredMask.getContext('2d');
  if (fCtx) {
    if (featherRadius > 0) {
      fCtx.filter = `blur(${featherRadius}px)`;
    }
    fCtx.drawImage(maskCanvas, 0, 0);
  }

  // 3. Prepare masked edit layer
  const editLayer = document.createElement('canvas');
  editLayer.width = width;
  editLayer.height = height;
  const eCtx = editLayer.getContext('2d');
  if (eCtx) {
    eCtx.drawImage(editedImage, 0, 0, width, height);
    // Mask with feathered alpha
    eCtx.globalCompositeOperation = 'destination-in';
    eCtx.drawImage(featheredMask, 0, 0);

    // 4. Composite over base image
    ctx.drawImage(editLayer, 0, 0);
  }

  return canvas.toDataURL('image/jpeg', 0.94);
}

/**
 * Executes high-precision masked curtain generation:
 * - Sorts assignments by topological priority (large drape panels first, thin trims & borders last)
 * - Sends clean high-res 1024x1280 base plate and 1024x1024 fabric swatches
 * - Preserves background pixels with feathered alpha compositing
 */
export async function executeMaskedPipeline(
  template: CurtainTemplate,
  assignments: FabricAssignment[],
  fabrics: Fabric[],
  onStepProgress?: (step: string) => void
): Promise<{ success: boolean; imageUrl: string; message?: string }> {
  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  // 1. Resolve authentic clean source photo (never the synthetic mockup canvas)
  const basePhotoUrl = template.original_image_url || getTemplateRealPhotoUrl(template, 1024, 1280);
  onStepProgress?.('Rasterizing authentic high-res curtain plate (1024×1280)...');
  const cleanBaseBase64 = await rasterizeToPngBase64(basePhotoUrl, 1024, 1280);
  const baseImage = await loadImage(cleanBaseBase64);

  // Sort assignments by region order (e.g. 1 = main body, 2 = flanking, 3 = horizontal band, 4 = hem trim)
  const sortedAssignments = [...assignments].sort((a, b) => {
    const regA = template.regions.find((r) => r.id === a.region_id);
    const regB = template.regions.find((r) => r.id === b.region_id);
    return (regA?.order || 0) - (regB?.order || 0);
  });

  // Prepare high-res swatches (1024x1024 to preserve houndstooth, slub linen, damask, embroidery detail)
  onStepProgress?.('Encoding textile swatches at 1024×1024 micro-weave resolution...');
  const assignmentPayload = await Promise.all(
    sortedAssignments.map(async (asg, idx) => {
      const reg = template.regions.find((r) => r.id === asg.region_id);
      const fab = fabricMap.get(asg.fabric_id);

      let rasterBase64 = '';
      if (fab?.image_url) {
        rasterBase64 = await rasterizeToPngBase64(fab.image_url, 1024, 1024);
      }

      // Generate region mask
      const maskCanvas = createRegionMaskCanvas(reg || template.regions[0], 1024, 1280);
      const maskBase64 = maskCanvas.toDataURL('image/png');

      // Generate tinted guidance plate
      const tintColor = REGION_TINTS[idx % REGION_TINTS.length];
      const tintedCanvas = createTintedGuidanceCanvas(baseImage, maskCanvas, tintColor);
      const tintedBase64 = tintedCanvas.toDataURL('image/png');

      return {
        regionId: reg?.id || '',
        regionName: reg?.name || 'region',
        regionDisplayName: reg?.display_name || 'Curtain Zone',
        regionDescription: reg?.description || 'Curtain drapery section',
        order: reg?.order || idx + 1,
        fabricName: fab?.name || 'Luxe Fabric',
        fabricWeave: fab?.metadata.weave || 'woven',
        fabricColorHex: fab?.color_hex || '#D4AF37',
        fabricCategory: fab?.category || 'Drapery',
        fabricImageBase64: rasterBase64,
        maskImageBase64: maskBase64,
        tintedImageBase64: tintedBase64,
        tintColor,
      };
    })
  );

  onStepProgress?.('Executing positional generative draping via Gemini AI...');

  // Call the server API with positional, constraint-based prompt payload
  const response = await fetch('/api/generate-curtain-fabric', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateName: template.name,
      templateImage: cleanBaseBase64,
      assignments: assignmentPayload,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.imageUrl) {
    throw new Error(data.error || 'Generative redesign failed.');
  }

  onStepProgress?.('Applying sub-pixel feathered edge compositing...');

  // Combine region masks into a master curtain mask for pristine room background preservation
  const combinedMaskCanvas = document.createElement('canvas');
  combinedMaskCanvas.width = 1024;
  combinedMaskCanvas.height = 1280;
  const cmCtx = combinedMaskCanvas.getContext('2d');
  if (cmCtx) {
    cmCtx.fillStyle = '#000000';
    cmCtx.fillRect(0, 0, 1024, 1280);
    template.regions.forEach((reg) => {
      const regMask = createRegionMaskCanvas(reg, 1024, 1280);
      cmCtx.drawImage(regMask, 0, 0);
    });
  }

  // Load generated AI output and composite with feathered mask
  const aiOutputImg = await loadImage(data.imageUrl);
  const compositedUrl = featheredComposite(baseImage, aiOutputImg, combinedMaskCanvas, 3);

  return {
    success: true,
    imageUrl: compositedUrl || data.imageUrl,
    message: 'Photorealistic AI draping completed with zero background drift and preserved folds.',
  };
}
