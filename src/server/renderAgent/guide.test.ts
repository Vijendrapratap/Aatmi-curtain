import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { drawAreaGuide, cropArea } from './guide';
import { getImageSize, pixelAt } from './lock';

async function solid(w: number, h: number, rgb: [number, number, number]): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}
const zone = (id: string, x1: number, y1: number, x2: number, y2: number) => ({ id, display_name: id, description: '', location: '', polygon_coords: [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }] });

describe('drawAreaGuide', () => {
  it('keeps the photo size and paints an outline where the area edge is', async () => {
    const photo = await solid(200, 300, [200, 200, 200]);
    const guide = await drawAreaGuide(photo, [zone('top', 10, 10, 90, 50), zone('bottom', 10, 50, 90, 90)]);
    expect(await getImageSize(guide)).toEqual({ width: 200, height: 300 });
    const edge = await pixelAt(guide, 100, 30); // on the top area's top edge (y = 10% of 300)
    const inside = await pixelAt(guide, 40, 80); // inside the top area, away from the number badge
    expect(edge).not.toEqual([200, 200, 200]);
    expect(Math.abs(inside[0] - 200) + Math.abs(inside[1] - 200) + Math.abs(inside[2] - 200)).toBeLessThan(90);
  });
});

describe('cropArea', () => {
  it('extracts the area with a margin and upscales small crops', async () => {
    const photo = await solid(200, 300, [10, 20, 30]);
    const crop = await cropArea(photo, zone('band', 20, 40, 80, 50), 4, 600);
    const size = await getImageSize(crop);
    expect(size.width).toBe(600);
    // 68% of 200 wide (60 + 2*4 margin) × 18% of 300 tall, scaled to 600 wide → ~238 tall
    expect(size.height).toBeGreaterThan(200);
    expect(size.height).toBeLessThan(280);
  });
});
