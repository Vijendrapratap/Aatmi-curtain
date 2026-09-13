// src/lib/renderClient.ts
// Browser-side helpers for the render job API.
import type { CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';

export interface RenderCandidateView { id: string; round: number; image: string; scores: Array<{ key: string; score: number; reason: string }>; total: number; passed: boolean }
export interface RenderJobView {
  id: string;
  kind: 'fabric_swap' | 'room_stage';
  status: 'queued' | 'running' | 'done' | 'needs_review' | 'failed';
  stage: 'prompt' | 'generate' | 'grade' | 'lock' | 'store';
  round: number;
  candidates: RenderCandidateView[];
  result?: { finalImage: string; chosenId: string; prompt: string; candidates: RenderCandidateView[] };
  error?: string;
}

export const STAGE_COPY: Record<RenderJobView['stage'], string> = {
  prompt: 'Preparing',
  generate: 'Generating 3 options',
  grade: 'Checking quality',
  lock: 'Locking background',
  store: 'Finishing',
};

export const POLL_INTERVAL_MS = 2000;

/** Loads any image source (path, http, data, svg) and returns a PNG data URL at its natural size. */
export function toDataUrl(src: string): Promise<string> {
  if (src.startsWith('data:image/png') || src.startsWith('data:image/jpeg') || src.startsWith('data:image/webp')) return Promise.resolve(src);
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith('http')) img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 1024;
      c.height = img.naturalHeight || 1024;
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Could not load image ${src.slice(0, 60)}`));
    img.src = src;
  });
}

export async function buildFabricSwapInput(template: CurtainTemplate, assignments: FabricAssignment[], fabrics: Fabric[], brandId: string) {
  const templatePhoto = await toDataUrl(template.original_image_url || template.real_photo_url || '');
  const changes = [];
  for (const a of assignments) {
    const fabric = fabrics.find((f) => f.id === a.fabric_id);
    const zone = template.regions.find((r) => r.id === a.region_id);
    if (!fabric || !zone) continue;
    changes.push({ regionId: zone.id, fabricName: fabric.name, weave: fabric.metadata?.weave || 'woven', colorHex: fabric.color_hex, category: fabric.category, swatch: await toDataUrl(fabric.image_url) });
  }
  return {
    kind: 'fabric_swap' as const,
    brandId,
    templateName: template.name,
    templatePhoto,
    zones: template.regions.map((r) => ({ id: r.id, display_name: r.display_name, description: r.description, location: r.location, polygon_coords: r.polygon_coords })),
    changes,
    curtainMask: template.curtain_mask_url,
  };
}

export async function startRender(body: object, fetchImpl: typeof fetch = fetch): Promise<string> {
  const res = await fetchImpl('/api/render/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Render request failed (${res.status})`), { code: data.code });
  return data.jobId;
}

export async function pollRender(
  jobId: string,
  onUpdate: (job: RenderJobView) => void,
  opts: { fetchImpl?: typeof fetch; intervalMs?: number; sleep?: (ms: number) => Promise<void> } = {}
): Promise<RenderJobView> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const interval = opts.intervalMs ?? POLL_INTERVAL_MS;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  for (;;) {
    const res = await fetchImpl(`/api/render/jobs/${jobId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Render job lookup failed (${res.status})`);
    const job = data as RenderJobView;
    onUpdate(job);
    if (job.status === 'done' || job.status === 'needs_review' || job.status === 'failed') return job;
    await sleep(interval);
  }
}
