// src/server/renderAgent/prompt.ts
import type { BuiltPrompt, FabricSwapInput, RoomStageInput, Bbox, ZoneInput, Lighting } from './types';

export const LIGHTING_TEXT: Record<Exclude<Lighting, 'as_photographed'>, string> = {
  daylight: 'bright natural daylight from the window, soft neutral shadows',
  golden_hour: 'warm late-afternoon golden-hour sunlight streaming through the window, long soft shadows',
  evening: 'evening interior light from warm lamps, the window dim, gentle pools of light on the fabric',
  night: 'night time, the window dark, the room lit only by warm lamps, deep soft shadows',
};

export function isRelit(lighting?: Lighting): lighting is Exclude<Lighting, 'as_photographed'> {
  return Boolean(lighting) && lighting !== 'as_photographed';
}

const PRESERVE_TAIL =
  'Keep the rod, wall, floor, window and everything outside the curtain exactly as in Image 1. No text, no watermark, no added objects, no change of camera angle or crop.';

function zoneLabel(z: ZoneInput): string {
  return `${z.display_name} (${z.description}; ${z.location})`;
}

function problemsTail(previousProblems?: string[]): string {
  if (!previousProblems || previousProblems.length === 0) return '';
  return `\n\nPrevious attempt problems, avoid these: ${previousProblems.join('; ')}.`;
}

export function buildFabricSwapPrompt(input: FabricSwapInput, previousProblems?: string[]): BuiltPrompt {
  const zoneById = new Map(input.zones.map((z) => [z.id, z]));
  const changed = input.changes.map((c) => {
    const zone = zoneById.get(c.regionId);
    if (!zone) throw new Error(`Unknown zone "${c.regionId}" in changes`);
    return { change: c, zone };
  });
  const untouched = input.zones.filter((z) => !input.changes.some((c) => c.regionId === z.id));

  const legend = ['Image 1: the curtain photograph.']
    .concat(changed.map(({ zone }, i) => `Image ${i + 2}: fabric for the ${zone.display_name}.`))
    .join('\n');

  const relit = isRelit(input.lighting);
  const lightLine = relit ? 'Light the fabric consistently with the new lighting described below.' : 'Keep the original lighting, shadows and highlights.';
  const instructions = changed
    .map(({ change, zone }, i) =>
      `Replace the ${zoneLabel(zone)} entirely with the fabric in Image ${i + 2} (${change.fabricName}, ${change.weave}, colour ${change.colorHex}). The fabric must fall into the existing pleats and folds. Pattern repeat about 1/20 of the curtain height. ${lightLine}`
    )
    .join('\n\n');

  const untouchedClause = untouched.length
    ? `Leave these zones ${relit ? 'as they are in Image 1 apart from the lighting' : 'exactly as they are in Image 1'}: ${untouched.map(zoneLabel).join('; ')}.\n`
    : '';

  const relightClause = relit
    ? `Relight the whole photograph as ${LIGHTING_TEXT[input.lighting as Exclude<Lighting, 'as_photographed'>]}. Keep the geometry, framing and every surface the same; only the light changes.\n`
    : '';
  const preserve = relit ? PRESERVE_TAIL.replace('exactly as in Image 1', 'as in Image 1 apart from the lighting') : PRESERVE_TAIL;

  const text =
    `Edit Image 1, a photograph of a curtain, by changing the fabric of specific zones. Return one photograph with the same framing.\n\n` +
    `${legend}\n\n${instructions}\n\n${untouchedClause}${relightClause}${preserve}` +
    problemsTail(previousProblems);

  return { text, images: [input.templatePhoto, ...changed.map(({ change }) => change.swatch)] };
}

export function buildRoomStagePrompt(input: RoomStageInput, windowBbox: Bbox, previousProblems?: string[]): BuiltPrompt {
  const r = (n: number) => Math.round(n);
  const x2 = r(windowBbox.x + windowBbox.width);
  const y2 = r(windowBbox.y + windowBbox.height);
  const relit = isRelit(input.lighting);
  const light = relit
    ? `Relight the whole room as ${LIGHTING_TEXT[input.lighting as Exclude<Lighting, 'as_photographed'>]}, and light the curtains to match, with soft contact shadows on the floor.`
    : `Match the room's daylight and cast soft contact shadows on the floor.`;
  const keep = relit
    ? `Keep the furniture, floor, walls, ceiling and everything outside the window as in Image 1 apart from the lighting.`
    : `Keep the furniture, floor, walls, ceiling, lighting and everything outside the window exactly as in Image 1.`;
  const text =
    `Edit Image 1, a photograph of a real room, by hanging the curtains shown in Image 2 on its window. Return one photograph with the same framing.\n\n` +
    `Image 1: the room photograph.\nImage 2: the curtain design to hang.\n\n` +
    `The window occupies roughly x ${r(windowBbox.x)}-${x2}%, y ${r(windowBbox.y)}-${y2}% of Image 1. Mount the curtains from Image 2 across that window from ceiling to floor at a plausible scale, keeping their fabrics, bands and pleats exactly as shown. ${light}\n\n` +
    `${keep} No text, no watermark, no added objects, no change of camera angle or crop.` +
    problemsTail(previousProblems);
  return { text, images: [input.roomPhoto, input.curtainImage] };
}

const RATIOS: Array<[string, number]> = [
  ['1:1', 1], ['4:5', 0.8], ['5:4', 1.25], ['3:4', 0.75], ['4:3', 4 / 3],
  ['2:3', 2 / 3], ['3:2', 1.5], ['9:16', 9 / 16], ['16:9', 16 / 9], ['16:10', 1.6], ['21:9', 21 / 9],
];

export function closestAspectRatio(width: number, height: number): string {
  const target = width / height;
  let best = RATIOS[0];
  for (const r of RATIOS) if (Math.abs(r[1] - target) < Math.abs(best[1] - target)) best = r;
  return best[0];
}
