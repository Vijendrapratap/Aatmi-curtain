// src/server/renderAgent/lock.ts
import sharp from 'sharp';
import type { Bbox, ZoneInput } from './types';
import { FatalError } from './errors';

function toBuffer(dataUrl: string): Buffer {
  const i = dataUrl.indexOf('base64,');
  if (i < 0) throw new FatalError('Expected a base64 data URL', 'BAD_REQUEST');
  return Buffer.from(dataUrl.slice(i + 7), 'base64');
}

function toDataUrl(png: Buffer): string {
  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  const meta = await sharp(toBuffer(dataUrl)).metadata();
  if (!meta.width || !meta.height) throw new FatalError('Could not read image size', 'BAD_REQUEST');
  return { width: meta.width, height: meta.height };
}

async function rasterizeMaskSvg(svg: string, featherPx: number): Promise<string> {
  let img = sharp(Buffer.from(svg)).grayscale();
  if (featherPx > 0) img = img.blur(featherPx);
  return toDataUrl(await img.png().toBuffer());
}

/**
 * Union of the zone polygons, grown by `dilatePct` of the shorter image side so a slightly loose
 * polygon never lets the old fabric show through at an area's edge after the lock.
 */
export async function polygonMaskPng(zones: ZoneInput[], width: number, height: number, featherPx = 6, dilatePct = 2.5): Promise<string> {
  const grow = (dilatePct / 100) * Math.min(width, height) * 2; // stroke straddles the edge, so half of it extends outward
  const polys = zones
    .filter((z) => z.polygon_coords && z.polygon_coords.length >= 3)
    .map((z) => `<polygon fill="white" stroke="white" stroke-width="${grow}" stroke-linejoin="round" points="${z.polygon_coords.map((p) => `${(p.x / 100) * width},${(p.y / 100) * height}`).join(' ')}"/>`)
    .join('');
  if (!polys) throw new FatalError('Template has no zone polygons to build a curtain mask from', 'NO_MASK');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/>${polys}</svg>`;
  return rasterizeMaskSvg(svg, featherPx);
}

export async function bboxMaskPng(bbox: Bbox, width: number, height: number, expandPct = 20, featherPx = 6): Promise<string> {
  const ex = (bbox.width * expandPct) / 100;
  const ey = (bbox.height * expandPct) / 100;
  const x1 = Math.max(0, bbox.x - ex);
  const y1 = Math.max(0, bbox.y - ey);
  const x2 = Math.min(100, bbox.x + bbox.width + ex);
  const y2 = Math.min(100, bbox.y + bbox.height + ey);
  const rect = `<rect fill="white" x="${(x1 / 100) * width}" y="${(y1 / 100) * height}" width="${((x2 - x1) / 100) * width}" height="${((y2 - y1) / 100) * height}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/>${rect}</svg>`;
  return rasterizeMaskSvg(svg, featherPx);
}

/**
 * Composite `candidate` over `original` using `mask` (white = take candidate).
 * Output size is the original's aspect ratio at the larger of the two widths, so a
 * 2K model result is not thrown away when the source photo is small: the original is
 * upscaled for the background, the candidate is fitted to the same frame.
 */
export async function lockOutsideMask(original: string, candidate: string, mask: string): Promise<string> {
  const orig = await getImageSize(original);
  const cand = await getImageSize(candidate);
  const width = Math.max(orig.width, cand.width);
  const height = Math.round((width * orig.height) / orig.width);
  const maskGrey = await sharp(toBuffer(mask)).resize(width, height, { fit: 'fill' }).grayscale().toColourspace('b-w').raw().toBuffer();
  const candidateRgb = await sharp(toBuffer(candidate)).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const candidateRgba = await sharp(candidateRgb, { raw: { width, height, channels: 3 } })
    .joinChannel(maskGrey, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  const background = sharp(toBuffer(original)).resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).removeAlpha();
  const out = await background.composite([{ input: candidateRgba, blend: 'over' }]).png().toBuffer();
  return toDataUrl(out);
}

export async function pixelAt(dataUrl: string, x: number, y: number): Promise<[number, number, number]> {
  const { data, info } = await sharp(toBuffer(dataUrl)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}
