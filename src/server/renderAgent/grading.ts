// src/server/renderAgent/grading.ts
import type { GradeItem, RenderJobKind } from './types';
import { RetryableError } from './errors';

export const MIN_ITEM_SCORE = 6;
/** Stricter floors for items that decide whether the job did what was asked. */
export const ITEM_MIN: Record<string, number> = { target_zones: 7, window_mounted: 7 };
export const itemMin = (key: string) => ITEM_MIN[key] ?? MIN_ITEM_SCORE;
export const MIN_TOTAL_SCORE = 35;

const SHARED = [
  { key: 'pleats_lighting', question: 'Do folds, pleats, shadows and highlights follow the original photograph?' },
  { key: 'no_artifacts', question: 'Is the image free of text, watermarks, added objects, and warped rod, wall, floor or furniture?' },
  { key: 'swatch_likeness', question: 'Does the new fabric resemble its swatch in colour, pattern and scale?' },
];

export const RUBRICS: Record<RenderJobKind, Array<{ key: string; question: string }>> = {
  fabric_swap: [
    { key: 'target_zones', question: 'Is the intended fabric applied to the ENTIRE intended area, edge to edge including corners and every part of a band, with no trace of the old fabric left, and nowhere else? Use the close-up images.' },
    { key: 'other_zones_unchanged', question: 'Does every zone that was not meant to change keep its original colour and pattern?' },
    ...SHARED,
  ],
  room_stage: [
    { key: 'window_mounted', question: 'Do the curtains hang on the detected window, full height, at a plausible scale?' },
    { key: 'room_unchanged', question: 'Are furniture, floor, walls and lighting unchanged from the original room photograph?' },
    ...SHARED,
  ],
};

export function buildGradePrompt(
  kind: RenderJobKind,
  context: { changes?: Array<{ zoneName: string; fabricName: string }>; relitAs?: string; crops?: number }
): { text: string } {
  const changes = context.changes ?? [];
  const crops = context.crops ?? 0;
  const base = kind === 'fabric_swap' ? changes.length + 2 : 3;
  const cropLegend = Array.from({ length: crops }, (_, i) => `Image ${base + 1 + i}: close-up of ${changes[i] ? `the ${changes[i].zoneName}` : `changed area ${i + 1}`} in the candidate; check that the new fabric fills it completely.`);
  const legend =
    kind === 'fabric_swap'
      ? ['Image 1: the original curtain photograph.']
          .concat(changes.map((c, i) => `Image ${i + 2}: swatch of ${c.fabricName}.`))
          .concat([`Image ${base}: the candidate render to grade.`])
          .concat(cropLegend)
      : ['Image 1: the original room photograph.', 'Image 2: the curtain design that should be hung.', 'Image 3: the candidate render to grade.'].concat(cropLegend);
  const expectation =
    kind === 'fabric_swap'
      ? changes.map((c, i) => `${c.zoneName} should now show ${c.fabricName} (Image ${i + 2}).`).join(' ')
      : 'The curtains from Image 2 should hang on the window of Image 1.';
  const items = RUBRICS[kind].map((r) => `- "${r.key}": ${r.question}`).join('\n');
  const schema = JSON.stringify({ items: RUBRICS[kind].map((r) => ({ key: r.key, score: 0, reason: '' })) });
  const relitNote = context.relitAs
    ? ` The scene was intentionally relit as ${context.relitAs}: do not penalise changes in brightness, colour temperature or shadows anywhere; judge only that folds and pleats follow the original and that the lighting is consistent across the whole image.`
    : '';
  const text =
    `You are a strict photo retoucher grading an AI edit.\n\n${legend.join('\n')}\n\nExpected change: ${expectation}${relitNote}\n\n` +
    `Score each item from 0 (unacceptable) to 10 (perfect) and give a one-sentence reason:\n${items}\n\n` +
    `Reply with exactly this JSON shape: ${schema}\nOutput valid JSON only.`;
  return { text };
}

export function gradeImages(_kind: RenderJobKind, original: string, swatches: string[], candidate: string, crops: string[] = []): string[] {
  return [original, ...swatches, candidate, ...crops];
}

export function parseGrade(raw: string, kind: RenderJobKind): GradeItem[] {
  const cleaned = (raw || '').replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new RetryableError(`Grader returned non-JSON: ${cleaned.slice(0, 120)}`);
  }
  const items: any[] = Array.isArray(parsed?.items) ? parsed.items : [];
  return RUBRICS[kind].map((r) => {
    const found = items.find((i) => i && i.key === r.key);
    if (!found || typeof found.score !== 'number') throw new RetryableError(`Grader reply missing item "${r.key}"`);
    const score = Math.max(0, Math.min(10, Math.round(found.score)));
    return { key: r.key, score, reason: String(found.reason ?? '') };
  });
}

export function total(items: GradeItem[]): number {
  return items.reduce((s, i) => s + i.score, 0);
}

export function passes(items: GradeItem[]): boolean {
  return items.every((i) => i.score >= itemMin(i.key)) && total(items) >= MIN_TOTAL_SCORE;
}

export function reasonsBelowThreshold(items: GradeItem[]): string[] {
  return items.filter((i) => i.score < itemMin(i.key)).map((i) => `${i.key}: ${i.reason}`);
}

/**
 * What to tell the model about the previous round. Below-threshold items when there are any;
 * otherwise the two weakest items, so a candidate that only failed the total rule still gets feedback.
 */
export function retryFeedback(items: GradeItem[]): string[] {
  const below = reasonsBelowThreshold(items);
  if (below.length > 0) return below;
  return items
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((i) => `${i.key}: ${i.reason}`);
}
