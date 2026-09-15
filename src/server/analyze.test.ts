import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import { analyzeCurtain, sanitizeRegions } from './analyze';

async function photo(): Promise<string> {
  const buf = await sharp({ create: { width: 60, height: 80, channels: 3, background: { r: 220, g: 210, b: 190 } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}
const rect = (x1: number, y1: number, x2: number, y2: number) => [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
const region = (display_name: string, polygon_coords: any, extra: any = {}) => ({ name: display_name.toLowerCase().replace(/ /g, '_'), display_name, description: 'd', location: 'l', polygon_coords, ...extra });

describe('sanitizeRegions', () => {
  it('clamps to the photo, drops degenerate and tiny areas, and gives duplicate names a suffix', () => {
    const out = sanitizeRegions([
      region('Main panel', rect(-5, 0, 60, 105)),
      region('Border', [{ x: 60, y: 0 }, { x: 60, y: 100 }]),
      region('Speck', rect(70, 70, 70.2, 70.2)),
      region('Main panel', rect(60, 0, 100, 100)),
      region('Bad', 'nope'),
    ]);
    expect(out.map((r) => r.display_name)).toEqual(['Main panel', 'Main panel 2']);
    expect(out[0].polygon_coords).toEqual(rect(0, 0, 60, 100));
  });
  it('snaps near-touching edges together so stacked bands share one seam', () => {
    const out = sanitizeRegions([region('Top', rect(0, 0, 100, 22)), region('Band', rect(0, 23, 100, 40))]);
    expect(out[1].polygon_coords[0].y).toBe(22);
  });
  it('orders large areas first', () => {
    const out = sanitizeRegions([region('Trim', rect(0, 0, 100, 5)), region('Panel', rect(0, 5, 100, 100))]);
    expect(out.map((r) => r.display_name)).toEqual(['Panel', 'Trim']);
  });
});

describe('analyzeCurtain', () => {
  it('asks once with the photo, then once more with the numbered guide, and returns the checked areas', async () => {
    const first = JSON.stringify([region('Left panel', rect(0, 0, 44, 100)), region('Right panel', rect(44, 0, 100, 100))]);
    const second = JSON.stringify([region('Left panel', rect(0, 0, 44, 100)), region('Right upper', rect(44, 0, 100, 30)), region('Right lower', rect(44, 30, 100, 100))]);
    const ask = vi.fn(async (req: { images: string[] }) => (req.images.length === 1 ? first : second));
    const out = await analyzeCurtain(await photo(), null, { ask });
    expect(ask).toHaveBeenCalledTimes(2);
    expect(ask.mock.calls[1][0].images).toHaveLength(2);
    expect(ask.mock.calls[1][0].images[1]).toMatch(/^data:image\/png;base64,/);
    expect(out.regions.map((r) => r.display_name)).toEqual(['Left panel', 'Right lower', 'Right upper']);
  });
  it('keeps the first pass when the check pass returns nothing usable', async () => {
    const first = JSON.stringify([region('Panel', rect(0, 0, 100, 100))]);
    const ask = vi.fn(async (req: { images: string[] }) => (req.images.length === 1 ? first : 'sorry, no'));
    const out = await analyzeCurtain(await photo(), null, { ask });
    expect(out.regions.map((r) => r.display_name)).toEqual(['Panel']);
  });
  it('fails when the first pass finds no areas', async () => {
    await expect(analyzeCurtain(await photo(), null, { ask: async () => '[]' })).rejects.toThrow(/no fabric areas/i);
  });
});
