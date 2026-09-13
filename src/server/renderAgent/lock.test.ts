// src/server/renderAgent/lock.test.ts
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { getImageSize, polygonMaskPng, bboxMaskPng, lockOutsideMask, pixelAt } from './lock';

async function solid(w: number, h: number, rgb: [number, number, number]): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

describe('getImageSize', () => {
  it('reads dimensions from a data url', async () => {
    expect(await getImageSize(await solid(40, 30, [0, 0, 0]))).toEqual({ width: 40, height: 30 });
  });
});

describe('polygonMaskPng', () => {
  it('is white inside the polygon and black outside with no feather', async () => {
    const mask = await polygonMaskPng([{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }] }], 40, 40, 0);
    expect((await pixelAt(mask, 5, 20))[0]).toBe(255);
    expect((await pixelAt(mask, 35, 20))[0]).toBe(0);
  });
});

describe('polygonMaskPng dilation', () => {
  it('grows the mask a little beyond the polygon edge', async () => {
    const zones = [{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }] }];
    const tight = await polygonMaskPng(zones, 100, 100, 0, 0);
    const grown = await polygonMaskPng(zones, 100, 100, 0, 3);
    expect((await pixelAt(tight, 52, 50))[0]).toBe(0);
    expect((await pixelAt(grown, 52, 50))[0]).toBe(255);
    expect((await pixelAt(grown, 58, 50))[0]).toBe(0);
  });
});

describe('bboxMaskPng', () => {
  it('expands the box by the given percent and clamps to the image', async () => {
    const mask = await bboxMaskPng({ x: 40, y: 40, width: 20, height: 20 }, 100, 100, 15, 0);
    // box becomes x 37-63 (20 * 0.15 = 3 each side)
    expect((await pixelAt(mask, 38, 50))[0]).toBe(255);
    expect((await pixelAt(mask, 35, 50))[0]).toBe(0);
  });
});

describe('lockOutsideMask', () => {
  it('keeps original pixels outside the mask and candidate pixels inside', async () => {
    const original = await solid(40, 40, [255, 0, 0]);
    const candidate = await solid(40, 40, [0, 0, 255]);
    const mask = await polygonMaskPng([{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }] }], 40, 40, 0);
    const out = await lockOutsideMask(original, candidate, mask);
    expect(await pixelAt(out, 5, 20)).toEqual([0, 0, 255]);
    expect(await pixelAt(out, 35, 20)).toEqual([255, 0, 0]);
  });
  it('keeps a larger candidate\'s resolution and upscales the original behind it', async () => {
    const original = await solid(40, 40, [255, 0, 0]);
    const candidate = await solid(80, 80, [0, 0, 255]);
    const mask = await polygonMaskPng([{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }] }], 40, 40, 0);
    const out = await lockOutsideMask(original, candidate, mask);
    expect(await getImageSize(out)).toEqual({ width: 80, height: 80 });
    expect(await pixelAt(out, 10, 40)).toEqual([0, 0, 255]);
    expect(await pixelAt(out, 70, 40)).toEqual([255, 0, 0]);
  });
  it('shrinks a smaller candidate up to the original\'s size', async () => {
    const original = await solid(40, 40, [255, 0, 0]);
    const candidate = await solid(20, 20, [0, 0, 255]);
    const mask = await polygonMaskPng([{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }], 40, 40, 0);
    const out = await lockOutsideMask(original, candidate, mask);
    expect(await getImageSize(out)).toEqual({ width: 40, height: 40 });
    expect(await pixelAt(out, 20, 20)).toEqual([0, 0, 255]);
  });
  it('blends at a feathered edge', async () => {
    const original = await solid(40, 40, [255, 0, 0]);
    const candidate = await solid(40, 40, [0, 0, 255]);
    const mask = await polygonMaskPng([{ id: 'a', display_name: '', description: '', location: '', polygon_coords: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }] }], 40, 40, 4);
    const [r, , b] = await pixelAt(await lockOutsideMask(original, candidate, mask), 20, 20);
    expect(r).toBeGreaterThan(20);
    expect(b).toBeGreaterThan(20);
  });
});
