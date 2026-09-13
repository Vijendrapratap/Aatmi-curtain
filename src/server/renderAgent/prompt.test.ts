// src/server/renderAgent/prompt.test.ts
import { describe, it, expect } from 'vitest';
import { buildFabricSwapPrompt, buildRoomStagePrompt, closestAspectRatio } from './prompt';
import type { FabricSwapInput, RoomStageInput } from './types';

const PHOTO = 'data:image/png;base64,PHOTO';
const SWATCH_A = 'data:image/png;base64,SWATCHA';
const SWATCH_B = 'data:image/png;base64,SWATCHB';

const base: FabricSwapInput = {
  kind: 'fabric_swap',
  brandId: 'brand-aatmi-01',
  templateName: 'Velvet & Houndstooth',
  templatePhoto: PHOTO,
  zones: [
    { id: 'top', display_name: 'Upper header', description: 'deeply pleated upper band', location: 'upper half, 0% to 50% height', polygon_coords: [] },
    { id: 'mid', display_name: 'Transition band', description: 'narrow horizontal satin band', location: '50% to 57.5% height', polygon_coords: [] },
    { id: 'skirt', display_name: 'Lower skirt', description: 'houndstooth skirt', location: '57.5% to 96% height', polygon_coords: [] },
  ],
  changes: [
    { regionId: 'top', fabricName: 'Denim Floral', weave: 'printed denim', colorHex: '#3b4a6b', category: 'Geometric', swatch: SWATCH_A },
  ],
};

describe('buildFabricSwapPrompt', () => {
  it('attaches the photo first then one swatch per change, in change order', () => {
    const p = buildFabricSwapPrompt({ ...base, changes: [...base.changes, { regionId: 'skirt', fabricName: 'Forest Velvet', weave: 'velvet', colorHex: '#1f3d2b', category: 'Velvet', swatch: SWATCH_B }] });
    expect(p.images).toEqual([PHOTO, SWATCH_A, SWATCH_B]);
  });
  it('produces the exact text for one changed zone', () => {
    const p = buildFabricSwapPrompt(base);
    expect(p.text).toBe(
`Edit Image 1, a photograph of a curtain, by changing the fabric of specific zones. Return one photograph with the same framing.

Image 1: the curtain photograph.
Image 2: fabric for the Upper header.

Replace the Upper header (deeply pleated upper band; upper half, 0% to 50% height) entirely with the fabric in Image 2 (Denim Floral, printed denim, colour #3b4a6b). The fabric must fall into the existing pleats and folds. Pattern repeat about 1/20 of the curtain height. Keep the original lighting, shadows and highlights.

Leave these zones exactly as they are in Image 1: Transition band (narrow horizontal satin band; 50% to 57.5% height); Lower skirt (houndstooth skirt; 57.5% to 96% height).
Keep the rod, wall, floor, window and everything outside the curtain exactly as in Image 1. No text, no watermark, no added objects, no change of camera angle or crop.`
    );
  });
  it('omits the untouched clause when every zone changes', () => {
    const all = { ...base, changes: base.zones.map((z) => ({ regionId: z.id, fabricName: 'X', weave: 'w', colorHex: '#000', category: 'c', swatch: SWATCH_A })) };
    expect(buildFabricSwapPrompt(all).text).not.toContain('Leave these zones');
  });
  it('appends previous problems on a retry', () => {
    const p = buildFabricSwapPrompt(base, ['skirt was recoloured', 'rod warped']);
    expect(p.text.endsWith('\n\nPrevious attempt problems, avoid these: skirt was recoloured; rod warped.')).toBe(true);
  });
  it('throws when a change references an unknown zone', () => {
    expect(() => buildFabricSwapPrompt({ ...base, changes: [{ ...base.changes[0], regionId: 'nope' }] })).toThrow(/unknown zone/i);
  });
});

describe('lighting', () => {
  it('relights the curtain photo and relaxes the preservation clause', () => {
    const p = buildFabricSwapPrompt({ ...base, lighting: 'night' });
    expect(p.text).toContain('Relight the whole photograph as night time');
    expect(p.text).toContain('Light the fabric consistently with the new lighting');
    expect(p.text).toContain('as in Image 1 apart from the lighting');
    expect(p.text).not.toContain('Keep the original lighting');
  });
  it('as_photographed changes nothing', () => {
    expect(buildFabricSwapPrompt({ ...base, lighting: 'as_photographed' }).text).toBe(buildFabricSwapPrompt(base).text);
  });
  it('relights a staged room', () => {
    const p = buildRoomStagePrompt({ kind: 'room_stage', brandId: 'b', roomPhoto: PHOTO, curtainImage: SWATCH_A, lighting: 'golden_hour' }, { x: 0, y: 0, width: 100, height: 100 });
    expect(p.text).toContain('Relight the whole room as warm late-afternoon');
    expect(p.text).toContain('apart from the lighting');
  });
});

describe('buildRoomStagePrompt', () => {
  const input: RoomStageInput = { kind: 'room_stage', brandId: 'b', roomPhoto: PHOTO, curtainImage: SWATCH_A };
  it('attaches room then curtain and writes the window box as percentages', () => {
    const p = buildRoomStagePrompt(input, { x: 30, y: 10, width: 40, height: 85 });
    expect(p.images).toEqual([PHOTO, SWATCH_A]);
    expect(p.text).toBe(
`Edit Image 1, a photograph of a real room, by hanging the curtains shown in Image 2 on its window. Return one photograph with the same framing.

Image 1: the room photograph.
Image 2: the curtain design to hang.

The window occupies roughly x 30-70%, y 10-95% of Image 1. Mount the curtains from Image 2 across that window from ceiling to floor at a plausible scale, keeping their fabrics, bands and pleats exactly as shown. Match the room's daylight and cast soft contact shadows on the floor.

Keep the furniture, floor, walls, ceiling, lighting and everything outside the window exactly as in Image 1. No text, no watermark, no added objects, no change of camera angle or crop.`
    );
  });
});

describe('closestAspectRatio', () => {
  it('maps common sizes', () => {
    expect(closestAspectRatio(800, 1000)).toBe('4:5');
    expect(closestAspectRatio(1600, 1000)).toBe('16:10');
    expect(closestAspectRatio(1000, 1000)).toBe('1:1');
    expect(closestAspectRatio(242, 537)).toBe('9:16');
  });
});
