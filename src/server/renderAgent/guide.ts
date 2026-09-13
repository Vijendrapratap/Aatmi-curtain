// src/server/renderAgent/guide.ts
// Visual references for the model and the grader: the photo with areas outlined and numbered, and close-up crops.
import sharp from 'sharp';
import { areaAnchors, bbox } from '../../lib/areaGeometry';
import type { ZoneInput } from './types';
import { getImageSize } from './lock';

function toBuffer(dataUrl: string): Buffer {
  const i = dataUrl.indexOf('base64,');
  return Buffer.from(dataUrl.slice(i + 7), 'base64');
}
const toDataUrl = (png: Buffer) => `data:image/png;base64,${png.toString('base64')}`;

const COLOURS = ['#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE', '#00C7BE', '#FF2D55', '#5856D6'];
export const guideColour = (i: number) => COLOURS[i % COLOURS.length];
export const guideColourName = (i: number) => ['red', 'green', 'blue', 'orange', 'purple', 'teal', 'pink', 'indigo'][i % 8];

/** The photo with every area outlined in its own colour and numbered 1..n at the same anchors the app shows. */
export async function drawAreaGuide(photo: string, zones: ZoneInput[]): Promise<string> {
  const { width, height } = await getImageSize(photo);
  const stroke = Math.max(3, Math.round(Math.min(width, height) / 160));
  const r = Math.max(14, Math.round(Math.min(width, height) / 22));
  const anchors = areaAnchors(zones.map((z) => z.polygon_coords));
  const px = (p: { x: number; y: number }) => `${(p.x / 100) * width},${(p.y / 100) * height}`;
  const shapes = zones.map((z, i) => {
    const pts = z.polygon_coords.map(px).join(' ');
    const a = anchors[i];
    const cx = (a.x / 100) * width, cy = (a.y / 100) * height;
    return `<polygon points="${pts}" fill="${guideColour(i)}" fill-opacity="0.12" stroke="white" stroke-width="${stroke * 2}" stroke-linejoin="round"/>
<polygon points="${pts}" fill="none" stroke="${guideColour(i)}" stroke-width="${stroke}" stroke-linejoin="round"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${guideColour(i)}" stroke="white" stroke-width="${stroke}"/>
<text x="${cx}" y="${cy}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(r * 1.2)}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${shapes}</svg>`;
  const out = await sharp(toBuffer(photo)).composite([{ input: Buffer.from(svg), blend: 'over' }]).png().toBuffer();
  return toDataUrl(out);
}

/** A close-up of one area (its bounding box plus a small margin), upscaled so thin bands are legible. */
export async function cropArea(image: string, zone: ZoneInput, padPct = 4, minWidth = 768): Promise<string> {
  const { width, height } = await getImageSize(image);
  const b = bbox(zone.polygon_coords);
  const x1 = Math.max(0, Math.floor(((b.x1 - padPct) / 100) * width));
  const y1 = Math.max(0, Math.floor(((b.y1 - padPct) / 100) * height));
  const x2 = Math.min(width, Math.ceil(((b.x2 + padPct) / 100) * width));
  const y2 = Math.min(height, Math.ceil(((b.y2 + padPct) / 100) * height));
  const w = Math.max(8, x2 - x1), h = Math.max(8, y2 - y1);
  let img = sharp(toBuffer(image)).extract({ left: x1, top: y1, width: w, height: h });
  if (w < minWidth) img = img.resize({ width: minWidth, kernel: 'lanczos3' });
  return toDataUrl(await img.png().toBuffer());
}
