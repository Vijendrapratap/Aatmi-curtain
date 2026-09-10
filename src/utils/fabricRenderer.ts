import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
import { generateRealisticPlate, drawPhotographicPleats } from './realisticPhotoPlates';

/**
 * Returns the authentic high-resolution real photograph data URL for a template
 */
export function getTemplateRealPhotoUrl(template: CurtainTemplate, width = 800, height = 1000): string {
  if (template.plate_id) {
    return generateRealisticPlate(template.plate_id, width, height);
  }
  if (template.real_photo_url) {
    return template.real_photo_url;
  }
  if (template.original_image_url && (template.original_image_url.startsWith('data:') || template.original_image_url.startsWith('http'))) {
    return template.original_image_url;
  }
  return generateRealisticPlate('default', width, height);
}

/**
 * Creates an offscreen Image element from a data URL, blob, or image source.
 * Does NOT set crossOrigin on data: or blob: URIs to avoid canvas origin tainting.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin on http/https sources
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      // If CORS failed on external URL, retry once without crossOrigin
      if (img.crossOrigin) {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = (e) => reject(e);
        fallback.src = src;
      } else {
        reject(err);
      }
    };
    img.src = src;
  });
}

/**
 * Converts any image source (including SVG data URLs or XML strings)
 * into a pure, standard PNG Data URL with base64 binary encoding.
 * Ensures compatibility with Gemini and external APIs that only accept raster images.
 */
export async function rasterizeToPngBase64(src: string, width = 256, height = 256): Promise<string> {
  if (!src || typeof src !== 'string') return '';
  // If already a standard raster base64 (PNG, JPEG, WEBP), return as-is
  if (
    src.startsWith('data:image/png;base64,') ||
    src.startsWith('data:image/jpeg;base64,') ||
    src.startsWith('data:image/webp;base64,')
  ) {
    return src;
  }
  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('rasterizeToPngBase64 fallback:', err);
    return '';
  }
}

/**
 * Procedurally generates an ultra-tactile fabric pattern tile canvas.
 * Guarantees instantaneous, zero-latency realistic fabric textures
 * without external network or async image dependencies.
 */
function createProceduralFabricPattern(
  fabric: Fabric | undefined,
  fallbackColor: string,
  scale: number = 1.0,
  rotationRad: number = 0
): HTMLCanvasElement {
  const size = Math.max(32, Math.round(96 * scale));
  const pCanvas = document.createElement('canvas');
  pCanvas.width = size;
  pCanvas.height = size;
  const pCtx = pCanvas.getContext('2d');
  if (!pCtx) return pCanvas;

  const baseColor = fabric?.color_hex || fallbackColor || '#DDD6C7';
  const category = (fabric?.category || '').toLowerCase();
  const weave = (fabric?.metadata?.weave || '').toLowerCase();

  pCtx.save();
  pCtx.translate(size / 2, size / 2);
  pCtx.rotate(rotationRad);
  pCtx.translate(-size / 2, -size / 2);

  // Base background fill
  pCtx.fillStyle = baseColor;
  pCtx.fillRect(0, 0, size, size);

  if (category.includes('velvet') || weave.includes('pile')) {
    // Plush velvet: subtle micro-pile grain & diagonal sheen
    const grad = pCtx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, size, size);

    // Micro pile striations
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    pCtx.lineWidth = 1;
    for (let i = 0; i < size; i += 4) {
      pCtx.beginPath();
      pCtx.moveTo(0, i);
      pCtx.lineTo(size, i);
      pCtx.stroke();
    }
  } else if (category.includes('exotic') || category.includes('relief') || weave.includes('embossed')) {
    // Crocodile / Reptilian geometric embossed relief with gilded seams
    const step = size / 3;
    pCtx.strokeStyle = 'rgba(255, 215, 120, 0.25)';
    pCtx.lineWidth = 2;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        pCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        pCtx.fillRect(x + 2, y + 2, step - 4, step - 4);
        pCtx.strokeRect(x + 2, y + 2, step - 4, step - 4);
        // Highlight dot
        pCtx.fillStyle = 'rgba(255, 220, 150, 0.35)';
        pCtx.beginPath();
        pCtx.arc(x + step * 0.5, y + step * 0.5, 2, 0, Math.PI * 2);
        pCtx.fill();
      }
    }
  } else if (category.includes('damask') || weave.includes('jacquard')) {
    // Ornate damask filigree motif
    pCtx.strokeStyle = 'rgba(255, 235, 180, 0.32)';
    pCtx.lineWidth = 2.2;
    pCtx.beginPath();
    // Medallion scroll
    const cx = size / 2;
    const cy = size / 2;
    pCtx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
    pCtx.stroke();
    pCtx.beginPath();
    pCtx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    pCtx.arc(size, 0, size * 0.25, 0, Math.PI * 2);
    pCtx.arc(0, size, size * 0.25, 0, Math.PI * 2);
    pCtx.arc(size, size, size * 0.25, 0, Math.PI * 2);
    pCtx.stroke();
    // Subtle sheen
    pCtx.fillStyle = 'rgba(255, 245, 220, 0.1)';
    pCtx.fill();
  } else if (category.includes('geometric') || weave.includes('trellis')) {
    // Trellis quatrefoil lattice
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    pCtx.lineWidth = 2;
    const mid = size / 2;
    pCtx.beginPath();
    pCtx.moveTo(mid, 0);
    pCtx.lineTo(size, mid);
    pCtx.lineTo(mid, size);
    pCtx.lineTo(0, mid);
    pCtx.closePath();
    pCtx.stroke();
  } else if (category.includes('silk') || weave.includes('dupioni')) {
    // Dupioni silk slub striations
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    pCtx.lineWidth = 1.2;
    for (let y = 3; y < size; y += 5) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(size, y);
      pCtx.stroke();
    }
    pCtx.fillStyle = 'rgba(255, 230, 200, 0.08)';
    pCtx.fillRect(0, 0, size, size);
  } else {
    // Natural linen / slub weave crosshatch
    pCtx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    pCtx.lineWidth = 1;
    for (let x = 0; x < size; x += 6) {
      pCtx.beginPath();
      pCtx.moveTo(x, 0);
      pCtx.lineTo(x, size);
      pCtx.stroke();
    }
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 0; y < size; y += 6) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(size, y);
      pCtx.stroke();
    }
  }

  pCtx.restore();
  return pCanvas;
}

/**
 * Extracts authentic photographic luminance maps (shadow folds and daylight highlights)
 * from a real drapery photograph to enable photorealistic texture transfer.
 */
function extractLuminanceCanvases(baseImg: HTMLImageElement, width: number, height: number) {
  try {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return null;
    offCtx.drawImage(baseImg, 0, 0, width, height);

    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Shadow/fold map: darker photo areas create realistic gravitational pleat depths
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = width;
    shadowCanvas.height = height;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (!shadowCtx) return null;
    const shadowImgData = shadowCtx.createImageData(width, height);
    const sData = shadowImgData.data;

    // Highlight map: specular pleat crests and soft daylight
    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.width = width;
    highlightCanvas.height = height;
    const highlightCtx = highlightCanvas.getContext('2d');
    if (!highlightCtx) return null;
    const highlightImgData = highlightCtx.createImageData(width, height);
    const hData = highlightImgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Perceptual grayscale luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Folds/Shadows: areas with lum < 155 get deep natural drapery shadowing
      const shadowRatio = Math.max(0, 155 - lum) / 155;
      sData[i] = 18;
      sData[i + 1] = 16;
      sData[i + 2] = 22;
      sData[i + 3] = Math.round(shadowRatio * 185);

      // Highlights: areas with lum > 170 get crest sheen
      const highlightRatio = Math.max(0, lum - 170) / 85;
      hData[i] = 255;
      hData[i + 1] = 250;
      hData[i + 2] = 240;
      hData[i + 3] = Math.round(Math.min(1, highlightRatio) * 140);
    }

    shadowCtx.putImageData(shadowImgData, 0, 0);
    highlightCtx.putImageData(highlightImgData, 0, 0);

    return { shadowCanvas, highlightCanvas };
  } catch (err) {
    console.warn('extractLuminanceCanvases note:', err);
    return null;
  }
}

export interface RenderCurtainOptions {
  showWireframe?: boolean;
  activeRegionId?: string | null;
  width?: number;
  height?: number;
  renderMode?: 'realistic' | 'wireframe' | 'depth' | 'canny';
  drawStitchLines?: boolean;
  includeWatermark?: boolean;
  cleanPlate?: boolean;
  useLuminanceTransfer?: boolean;
}

/**
 * Renders an ultra-realistic curtain mockup on HTML5 Canvas
 * preserving folds, ambient highlights, and shadow maps.
 */
export async function renderCurtainOnCanvas(
  canvas: HTMLCanvasElement,
  template: CurtainTemplate,
  assignments: FabricAssignment[],
  fabrics: Fabric[],
  options: RenderCurtainOptions = {}
): Promise<string> {
  const width = options.width || 800;
  const height = options.height || 1000;
  const useLuminanceTransfer = options.useLuminanceTransfer !== false;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Check for Authentic Photographic Base Plate or Real Curtain Photo
  let basePlateImg: HTMLImageElement | null = null;
  const realPhotoUrl = getTemplateRealPhotoUrl(template, width, height);

  if (realPhotoUrl) {
    try {
      basePlateImg = await loadImage(realPhotoUrl);
    } catch (e) {
      console.warn('Real photo plate load note:', e);
    }
  }

  // Precompute authentic photo luminance maps if available
  const luminanceMaps = basePlateImg && useLuminanceTransfer
    ? extractLuminanceCanvases(basePlateImg, width, height)
    : null;

  if (basePlateImg) {
    // Draw authentic high-resolution real photograph
    ctx.drawImage(basePlateImg, 0, 0, width, height);
  } else {
    // Fallback: Luxury Interior Architectural Background
    const wallGrad = ctx.createLinearGradient(0, 0, width, height);
    wallGrad.addColorStop(0, '#EAE8E1');
    wallGrad.addColorStop(0.5, '#E2DFD6');
    wallGrad.addColorStop(1, '#D8D4C8');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft window daylight casting from upper-left
    const lightGrad = ctx.createRadialGradient(width * 0.25, 0, 50, width * 0.4, height * 0.5, width * 0.9);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, width, height);

    // Hardwood floor baseboard / floor plane
    const floorGrad = ctx.createLinearGradient(0, height * 0.94, 0, height);
    floorGrad.addColorStop(0, '#A79C8C');
    floorGrad.addColorStop(0.3, '#7D6F5E');
    floorGrad.addColorStop(1, '#53483B');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height * 0.94, width, height * 0.06);

    // Baseboard trim line
    ctx.strokeStyle = '#D4CEBF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.94);
    ctx.lineTo(width, height * 0.94);
    ctx.stroke();

    // Curtain rod / brass hardware
    ctx.save();
    const rodY = height * 0.035;
    const rodGrad = ctx.createLinearGradient(0, rodY - 6, 0, rodY + 6);
    rodGrad.addColorStop(0, '#C29B38');
    rodGrad.addColorStop(0.4, '#F4E3A1');
    rodGrad.addColorStop(0.8, '#9B7826');
    rodGrad.addColorStop(1, '#56410E');
    ctx.fillStyle = rodGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(width * 0.06, rodY - 5, width * 0.88, 10);

    // Finials
    ctx.beginPath();
    ctx.arc(width * 0.06, rodY, 11, 0, Math.PI * 2);
    ctx.arc(width * 0.94, rodY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Pre-load all assigned fabric images (with safe fallback)
  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  const loadedFabricImages = new Map<string, HTMLImageElement>();
  for (const asg of assignments) {
    const fab = fabricMap.get(asg.fabric_id);
    if (fab && !loadedFabricImages.has(fab.id) && fab.image_url) {
      try {
        const img = await loadImage(fab.image_url);
        loadedFabricImages.set(fab.id, img);
      } catch (e) {
        console.warn('Fabric image load note for', fab.name, e);
      }
    }
  }

  // Helper to convert polygon coordinates to canvas points
  const getCanvasPoints = (coords: { x: number; y: number }[]) => {
    return coords.map((c) => ({
      x: (c.x / 100) * width,
      y: (c.y / 100) * height,
    }));
  };

  // Determine which regions to re-render:
  // If we have an authentic base plate and NO assignments, keep the real photo intact!
  // If we have assignments, only re-render regions that have assignments (or all regions if no base plate).
  const regionsToRender = template.regions.filter((r) => {
    if (!basePlateImg) return true;
    return assignments.some((a) => a.region_id === r.id);
  });

  // 3. Render Each Assigned Region with its new fabric & photorealistic drape shading
  for (const region of regionsToRender) {
    const points = getCanvasPoints(region.polygon_coords);
    if (points.length < 3) continue;

    const assignment = assignments.find((a) => a.region_id === region.id);
    const fabric = assignment ? fabricMap.get(assignment.fabric_id) : null;
    const fabricImg = fabric ? loadedFabricImages.get(fabric.id) : null;

    const scale = assignment?.scale || 1.0;
    const rotationRad = ((assignment?.rotation || 0) * Math.PI) / 180;

    ctx.save();
    // Clip strictly to region polygon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.clip();

    // 3a. Draw base color
    ctx.fillStyle = fabric?.color_hex || region.default_color || '#DDD6C7';
    ctx.fillRect(0, 0, width, height);

    // 3b. Draw procedural high-res texture pattern
    const procTile = createProceduralFabricPattern(fabric, region.default_color || '#DDD6C7', scale, rotationRad);
    const procPattern = ctx.createPattern(procTile, 'repeat');
    if (procPattern) {
      ctx.fillStyle = procPattern;
      ctx.fillRect(0, 0, width, height);
    }

    // 3c. If custom swatch image was loaded, composite it
    if (fabricImg) {
      const patternCanvas = document.createElement('canvas');
      const pWidth = Math.max(20, Math.round(fabricImg.width * scale));
      const pHeight = Math.max(20, Math.round(fabricImg.height * scale));
      patternCanvas.width = pWidth;
      patternCanvas.height = pHeight;
      const pCtx = patternCanvas.getContext('2d');
      if (pCtx) {
        pCtx.save();
        pCtx.translate(pWidth / 2, pHeight / 2);
        pCtx.rotate(rotationRad);
        pCtx.drawImage(fabricImg, -pWidth / 2, -pHeight / 2, pWidth, pHeight);
        pCtx.restore();

        const customPattern = ctx.createPattern(patternCanvas, 'repeat');
        if (customPattern) {
          ctx.fillStyle = customPattern;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // 3d. Photorealistic Luminance Transfer (Authentic Pleat Folds & Sunlight Crests from Real Photograph)
    if (luminanceMaps) {
      // Transfer authentic shadowed pleats
      ctx.drawImage(luminanceMaps.shadowCanvas, 0, 0);
      // Transfer authentic crest highlights in screen mode
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(luminanceMaps.highlightCanvas, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. Continuous Photorealistic Column Pleats across Drapery Panels
  // Rather than fragmenting pleats per small horizontal region or band,
  // we group regions into left/right drapery panels and apply continuous vertical drape
  if (regionsToRender.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    // Group regions into panels based on horizontal centroid
    const panels: Region[][] = [];
    template.regions.forEach((reg) => {
      const points = getCanvasPoints(reg.polygon_coords);
      const avgX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
      let matchedPanel = panels.find((pan) => {
        const panPoints = getCanvasPoints(pan[0].polygon_coords);
        const panAvgX = panPoints.reduce((acc, p) => acc + p.x, 0) / panPoints.length;
        return Math.abs(avgX - panAvgX) < width * 0.28;
      });
      if (matchedPanel) {
        matchedPanel.push(reg);
      } else {
        panels.push([reg]);
      }
    });

    panels.forEach((panel) => {
      let pMinX = width, pMaxX = 0, pMinY = height, pMaxY = 0;
      ctx.save();
      ctx.beginPath();
      panel.forEach((reg) => {
        const pts = getCanvasPoints(reg.polygon_coords);
        if (pts.length >= 3) {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
          pts.forEach((p) => {
            if (p.x < pMinX) pMinX = p.x;
            if (p.x > pMaxX) pMaxX = p.x;
            if (p.y < pMinY) pMinY = p.y;
            if (p.y > pMaxY) pMaxY = p.y;
          });
        }
      });
      ctx.clip();

      const panW = Math.max(20, pMaxX - pMinX);
      const panH = Math.max(20, pMaxY - pMinY);
      const pleatCount = Math.max(4, Math.round((panW / width) * 14));
      drawPhotographicPleats(ctx, pMinX, pMinY, panW, panH, pleatCount, 0.42);
      ctx.restore();
    });

    ctx.restore();
  }

  // 5. Specular Sheen & Sunlight Crest Layer (Screen Mode clipped to curtain)
  let boundMinX = width, boundMaxX = 0, boundMinY = height, boundMaxY = 0;
  template.regions.forEach((r) => {
    r.polygon_coords.forEach((c) => {
      const px = (c.x / 100) * width;
      const py = (c.y / 100) * height;
      if (px < boundMinX) boundMinX = px;
      if (px > boundMaxX) boundMaxX = px;
      if (py < boundMinY) boundMinY = py;
      if (py > boundMaxY) boundMaxY = py;
    });
  });

  const totalCurtainWidth = Math.max(10, boundMaxX - boundMinX);
  const pleatCount = 14;
  const pleatStep = totalCurtainWidth / pleatCount;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  template.regions.forEach((region) => {
    const points = getCanvasPoints(region.polygon_coords);
    if (points.length >= 3) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
    }
  });
  ctx.clip();

  for (let i = 0; i < pleatCount; i++) {
    const pleatX = boundMinX + i * pleatStep;
    const crestX = pleatX + pleatStep * 0.55;
    const sheenGrad = ctx.createLinearGradient(crestX - pleatStep * 0.15, 0, crestX + pleatStep * 0.15, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 250, 240, 0.25)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheenGrad;
    ctx.fillRect(crestX - pleatStep * 0.15, boundMinY, pleatStep * 0.3, boundMaxY - boundMinY);
  }
  ctx.restore();

  // 6. Seam Stitching lines between regions (Gold/Taupe tailored topstitch)
  // Only rendered if wireframe/stencil mode is requested and not in cleanPlate mode
  if (!options.cleanPlate && (options.drawStitchLines || options.showWireframe)) {
    ctx.save();
    ctx.strokeStyle = 'rgba(215, 195, 155, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);

    template.regions.forEach((region) => {
      const points = getCanvasPoints(region.polygon_coords);
      if (points.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();
  }

  // 7. Interactive UI Region Outlines / Hover Overlays
  if (!options.cleanPlate && (options.showWireframe || options.activeRegionId)) {
    ctx.save();
    template.regions.forEach((region) => {
      const isSelected = options.activeRegionId === region.id;
      const points = getCanvasPoints(region.polygon_coords);
      if (points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      if (isSelected) {
        ctx.fillStyle = 'rgba(79, 70, 229, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.stroke();

        // Draw pin badge
        const centerX = points.reduce((s, p) => s + p.x, 0) / points.length;
        const centerY = points.reduce((s, p) => s + p.y, 0) / points.length;
        ctx.fillStyle = '#4F46E5';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(region.order), centerX, centerY);
      } else if (options.showWireframe) {
        ctx.strokeStyle = region.accent_color || 'rgba(15, 90, 65, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // 8. Brand Watermark subtly in corner (cleanPlate skips this completely)
  if (!options.cleanPlate && options.includeWatermark) {
    ctx.save();
    ctx.fillStyle = 'rgba(70, 60, 50, 0.4)';
    ctx.font = '600 13px "Cinzel", serif';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'right';
    ctx.fillText('AATMI HAUTE COUTURE DRAPERY', width - 24, height - 20);
    ctx.restore();
  }

  try {
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch (err) {
    console.warn('Canvas toDataURL warning:', err);
    return '';
  }
}

/**
 * Generates simulated Canny Edge Structure Map from a rendered curtain
 */
export function generateCannyStructureMap(canvas: HTMLCanvasElement): string {
  try {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Simple Sobel edge detection for structure maps
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outCtx = outputCanvas.getContext('2d');
    if (!outCtx) return '';

    const outData = outCtx.createImageData(width, height);
    const outD = outData.data;

    // Grayscale and edge pass
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        const left = ((y * width + (x - 1)) * 4);
        const right = ((y * width + (x + 1)) * 4);
        const up = (((y - 1) * width + x) * 4);
        const down = (((y + 1) * width + x) * 4);

        const lumL = 0.299 * data[left] + 0.587 * data[left + 1] + 0.114 * data[left + 2];
        const lumR = 0.299 * data[right] + 0.587 * data[right + 1] + 0.114 * data[right + 2];
        const lumU = 0.299 * data[up] + 0.587 * data[up + 1] + 0.114 * data[up + 2];
        const lumD = 0.299 * data[down] + 0.587 * data[down + 1] + 0.114 * data[down + 2];

        const dx = lumR - lumL;
        const dy = lumD - lumU;
        const mag = Math.sqrt(dx * dx + dy * dy);

        const val = mag > 24 ? 255 : 0;
        outD[idx] = val;
        outD[idx + 1] = val;
        outD[idx + 2] = val;
        outD[idx + 3] = 255;
      }
    }

    outCtx.putImageData(outData, 0, 0);
    return outputCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('generateCannyStructureMap warning:', err);
    return '';
  }
}

