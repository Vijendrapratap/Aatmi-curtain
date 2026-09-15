// src/server/analyze.ts
// Finds the fabric areas in a curtain photo: one vision pass to propose them, a clean-up, then a second pass
// that looks at the numbered outline guide (the same picture the render model gets) and corrects it.
import { drawAreaGuide, drawPercentGrid } from './renderAgent/guide';
import type { VisionRequest } from './renderAgent/imageClient';

export interface Region {
  name: string;
  display_name: string;
  description: string;
  location: string;
  order?: number;
  multi_component?: boolean;
  replaceable?: boolean;
  suggested_sam_prompt?: string;
  polygon_coords: Array<{ x: number; y: number }>;
}

const MIN_AREA_PCT = 0.25; // of the photo; anything smaller is noise, not a trim
const SNAP_PCT = 3; // edges closer than this are the same seam (a ribbon trim is about 6% tall, so this cannot swallow one)

const FIELDS = `For each area return:
- name: snake_case identifier (e.g. "main_drape_panel", "leading_edge_border", "horizontal_accent_band")
- display_name: short title (e.g. "Main panel", "Leading edge border", "Accent band")
- description: the weave, fold structure and position in one sentence
- location: where it sits, in percent of the photo (e.g. "right panel, 44% to 100% width, 22% to 29% height")
- multi_component: true if the same fabric appears in two mirrored places (left and right panels)
- replaceable: true for fabric, false for rods, finials, walls
- polygon_coords: 4 to 8 clockwise points [{ "x": number, "y": number }] in percent of the photo, 0 to 100

Output ONLY a JSON array of these objects, no markdown.`;

const GRID_NOTE = `The photo carries a red dashed grid with labels every 10% of its width (top and bottom labels) and height (left and right labels). Read every coordinate off this grid; a seam halfway between the 20 and 30 lines is at 25.`;

export const PROPOSE_PROMPT = `You are marking up a curtain photograph so each fabric area can be recolored separately.
${GRID_NOTE}
Find every distinct fabric area that a customer could choose a different fabric for: main panels, vertical borders, horizontal accent bands, ribbon trims, headers, hems, valances.

Rules:
1. Every area is one continuous piece of the same fabric. If the left and right panels are the same fabric, that is one area with multi_component true.
2. Stacked bands must share their seams exactly: the bottom edge of one band is the top edge of the next, at the same y. Side-by-side panels share the same x.
3. Follow the real seams in the photo, not typical proportions. A thin ribbon trim is its own area even if it is only 3% tall.
4. Cover the full curtain fabric surface with 2 to 6 areas and nothing outside it.

${FIELDS}`;

export const CHECK_PROMPT = `Image 1 is a curtain photograph. Image 2 is the same photo with the proposed fabric areas outlined and numbered.
${GRID_NOTE}
Check every outline against the photo:
- Does each outline follow the real seams edge to edge? Move any edge that is off.
- Does one outline cover two different fabrics? Split it. Do two outlines cover the same fabric? Merge them.
- Is any fabric area missing (a thin ribbon, a hem, a border)? Add it.
Return the corrected, complete list of areas, in the same format, keeping the numbering order where the areas are unchanged.

${FIELDS}`;

function parseRegions(text: string): any[] {
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.search(/[[{]/);
  if (start < 0) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start));
    return Array.isArray(parsed) ? parsed : Array.isArray(parsed?.regions) ? parsed.regions : [];
  } catch {
    return [];
  }
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));
const polygonArea = (pts: Array<{ x: number; y: number }>) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0)) / 2;

/** Drops unusable areas, clamps to the photo, snaps near-touching seams, dedupes names and puts big areas first. */
export function sanitizeRegions(raw: unknown[]): Region[] {
  const regions: Region[] = [];
  for (const r of raw as any[]) {
    if (!r || typeof r !== 'object' || !Array.isArray(r.polygon_coords)) continue;
    const pts = r.polygon_coords
      .filter((p: any) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
      .map((p: any) => ({ x: clamp(Number(p.x)), y: clamp(Number(p.y)) }));
    if (pts.length < 3 || polygonArea(pts) < MIN_AREA_PCT) continue;
    regions.push({ ...r, polygon_coords: pts, display_name: String(r.display_name || r.name || 'Area').trim(), name: String(r.name || r.display_name || 'area').trim() });
  }
  // Snap: every coordinate moves to a coordinate of an earlier (larger, already placed) area when they are within SNAP_PCT.
  regions.sort((a, b) => polygonArea(b.polygon_coords) - polygonArea(a.polygon_coords));
  const xs: number[] = [], ys: number[] = [];
  const snap = (v: number, to: number[]) => { const hit = to.find((t) => Math.abs(t - v) <= SNAP_PCT); return hit === undefined ? v : hit; };
  for (const r of regions) {
    r.polygon_coords = r.polygon_coords.map((p) => ({ x: snap(p.x, xs), y: snap(p.y, ys) }));
    for (const p of r.polygon_coords) { if (!xs.includes(p.x)) xs.push(p.x); if (!ys.includes(p.y)) ys.push(p.y); }
  }
  const seen = new Map<string, number>();
  for (const r of regions) {
    const n = (seen.get(r.display_name) ?? 0) + 1;
    seen.set(r.display_name, n);
    if (n > 1) r.display_name = `${r.display_name} ${n}`;
  }
  return regions.filter((r) => polygonArea(r.polygon_coords) >= MIN_AREA_PCT);
}

/** Measured on the chevron photo (2026-09-15): gemini-2.5-flash put seams 8 points off; gemini-3.7-flash was within 2 points on every seam. */
export const ANALYZE_MODEL = process.env.OPENROUTER_ANALYZE_MODEL || 'google/gemini-3.7-flash';

export interface AnalyzeDeps { ask: (req: VisionRequest) => Promise<string>; model?: string }

export async function analyzeCurtain(photo: string, apiKey: string | null, deps: AnalyzeDeps): Promise<{ regions: Region[]; source: string }> {
  const gridded = await drawPercentGrid(photo);
  const proposed = sanitizeRegions(parseRegions(await deps.ask({ prompt: PROPOSE_PROMPT, images: [gridded], apiKey, model: deps.model ?? ANALYZE_MODEL })));
  if (proposed.length === 0) throw new Error('No fabric areas were found in this photo.');
  try {
    const guide = await drawPercentGrid(await drawAreaGuide(photo, proposed.map((r, i) => ({ id: `area-${i + 1}`, display_name: r.display_name, description: r.description, location: r.location, polygon_coords: r.polygon_coords }))));
    const checked = sanitizeRegions(parseRegions(await deps.ask({ prompt: CHECK_PROMPT, images: [gridded, guide], apiKey, model: deps.model ?? ANALYZE_MODEL })));
    if (checked.length > 0) return { regions: checked, source: 'vision_checked' };
  } catch (err: any) {
    console.warn('Area check pass failed, keeping the first pass:', err?.message || err);
  }
  return { regions: proposed, source: 'vision' };
}
