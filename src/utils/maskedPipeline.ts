import { loadImage, rasterizeToPngBase64, getTemplateRealPhotoUrl } from './fabricRenderer';
import type { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';

const TINTS = ['#00ff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#ffff00'];

async function toCanvas(src: string, w?: number, h?: number) {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = w || img.width; c.height = h || img.height;
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** Fallback mask when no SAM mask_url exists: rasterize the VLM polygon. */
export async function polygonMask(region: Region, w: number, h: number): Promise<string> {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff'; ctx.beginPath();
  region.polygon_coords.forEach((p, i) =>
    i ? ctx.lineTo((p.x / 100) * w, (p.y / 100) * h) : ctx.moveTo((p.x / 100) * w, (p.y / 100) * h));
  ctx.closePath(); ctx.fill();
  return c.toDataURL('image/png');
}

export async function tintRegion(base: string, mask: string, tint: string): Promise<string> {
  const c = await toCanvas(base); const ctx = c.getContext('2d')!;
  const m = await toCanvas(mask, c.width, c.height);
  const mc = document.createElement('canvas'); mc.width = c.width; mc.height = c.height;
  const mctx = mc.getContext('2d')!;
  mctx.drawImage(m, 0, 0); mctx.globalCompositeOperation = 'source-in';
  mctx.fillStyle = tint; mctx.fillRect(0, 0, mc.width, mc.height);
  mctx.globalAlpha = 0.9; ctx.drawImage(mc, 0, 0);
  return c.toDataURL('image/png');
}

/** Guide §5.2 step 4: keep ONLY the mask interior from the edit, feathered edges. */
export async function featheredComposite(base: string, edit: string, mask: string, featherPx = 4): Promise<string> {
  const c = await toCanvas(base); const ctx = c.getContext('2d')!;
  const e = await toCanvas(edit, c.width, c.height);
  const m = await toCanvas(mask, c.width, c.height);
  const mc = document.createElement('canvas'); mc.width = c.width; mc.height = c.height;
  const mctx = mc.getContext('2d')!;
  mctx.filter = `blur(${featherPx}px)`; mctx.drawImage(m, 0, 0); mctx.filter = 'none';
  mctx.globalCompositeOperation = 'source-in'; mctx.drawImage(e, 0, 0);
  ctx.drawImage(mc, 0, 0);
  return c.toDataURL('image/png');
}

export async function generateSequentialRedesign(opts: {
  template: CurtainTemplate; assignments: FabricAssignment[]; fabrics: Fabric[];
  callEdit: (payload: any) => Promise<any>; onStep?: (msg: string) => void;
}): Promise<{ imageUrl: string }> {
  // FIX 1: base = ORIGINAL PHOTO, never the canvas mockup
  const baseSrc = opts.template.original_image_url || getTemplateRealPhotoUrl(opts.template, 1024, 1280);
  let current = await rasterizeToPngBase64(baseSrc, 1024, 1280);
  const fabricMap = new Map(opts.fabrics.map(f => [f.id, f]));
  const ordered = [...opts.assignments].sort((a, b) =>
    (opts.template.regions.find(r => r.id === a.region_id)?.order ?? 0) -
    (opts.template.regions.find(r => r.id === b.region_id)?.order ?? 0));

  for (let i = 0; i < ordered.length; i++) {
    const asg = ordered[i];
    const region = opts.template.regions.find(r => r.id === asg.region_id)!;
    const fabric = fabricMap.get(asg.fabric_id)!;
    const tint = TINTS[i % TINTS.length];
    const mask = region.mask_url ? await rasterizeToPngBase64(region.mask_url, 1024, 1280)
                                 : await polygonMask(region, 1024, 1280);
    const guide = await tintRegion(current, mask, tint);
    const swatch = await rasterizeToPngBase64(fabric.image_url, 1024, 1024); // FIX 2: hi-res swatch
    opts.onStep?.(`Repainting "${region.display_name}" — zone ${i + 1}/${ordered.length}`);
    const res = await opts.callEdit({
      mode: 'single_region', templateName: opts.template.name,
      templateImage: current, guideImage: guide, tint,
      region: { name: region.name, displayName: region.display_name, description: region.description },
      fabric: { name: fabric.name, weave: fabric.metadata?.weave, category: fabric.category, imageBase64: swatch },
    });
    if (!res?.imageUrl) throw Object.assign(new Error(res?.error || 'Generation failed'), { needsPaidKey: res?.needsPaidKey });
    current = await featheredComposite(current, res.imageUrl, mask, 4); // guarantees zero bleed/drift
  }
  return { imageUrl: current };
}

export const executeMaskedPipeline = generateSequentialRedesign;
