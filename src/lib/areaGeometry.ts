// src/lib/areaGeometry.ts
// Pure geometry shared by the browser (markers) and the server (guide image): where to put each area's label.
export interface Pt { x: number; y: number }

/** Area-weighted centroid of a polygon in percent coordinates; falls back to the bbox centre for degenerate shapes. */
export function centroid(polygon: Pt[]): Pt {
  const n = polygon.length;
  if (n < 3) return bboxCentre(polygon);
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    const p = polygon[i], q = polygon[(i + 1) % n];
    const cross = p.x * q.y - q.x * p.y;
    a += cross; cx += (p.x + q.x) * cross; cy += (p.y + q.y) * cross;
  }
  if (Math.abs(a) < 1e-6) return bboxCentre(polygon);
  a *= 0.5;
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

export function bbox(polygon: Pt[]): { x1: number; y1: number; x2: number; y2: number } {
  const xs = polygon.map((p) => p.x), ys = polygon.map((p) => p.y);
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

export function bboxCentre(polygon: Pt[]): Pt {
  if (polygon.length === 0) return { x: 50, y: 50 };
  const b = bbox(polygon);
  return { x: (b.x1 + b.x2) / 2, y: (b.y1 + b.y2) / 2 };
}

const MIN_GAP = 9; // percent of the image between two labels

/**
 * One label anchor per area: the centroid, then nudged so no two labels sit within MIN_GAP of each other.
 * Later areas move down (or up when near the bottom) so the first area's label stays put.
 */
export function areaAnchors(polygons: Pt[][]): Pt[] {
  const out: Pt[] = [];
  for (const poly of polygons) {
    const c = centroid(poly);
    let p = { x: Math.max(12, Math.min(88, c.x)), y: Math.max(6, Math.min(94, c.y)) };
    for (let tries = 0; tries < 12; tries++) {
      const clash = out.find((o) => Math.hypot(o.x - p.x, o.y - p.y) < MIN_GAP);
      if (!clash) break;
      const dir = p.y > 80 ? -1 : 1;
      p = { x: p.x, y: Math.max(6, Math.min(94, clash.y + dir * MIN_GAP)) };
      if (Math.abs(p.y - clash.y) < MIN_GAP - 0.5) p = { x: Math.max(12, Math.min(88, p.x + MIN_GAP)), y: p.y };
    }
    out.push(p);
  }
  return out;
}

/** Plain-language geometry for a prompt: where the area sits, as percentages of the image. */
export function describeExtent(polygon: Pt[]): string {
  const b = bbox(polygon);
  const r = (n: number) => Math.round(n);
  return `covers roughly x ${r(b.x1)}–${r(b.x2)}%, y ${r(b.y1)}–${r(b.y2)}% of the image`;
}
