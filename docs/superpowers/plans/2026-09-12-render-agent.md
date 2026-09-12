# Render Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the synthetic curtain preview and per-zone client-side inpainting with a server-side render job that produces a photoreal, graded, background-locked product image, and reuse it for room staging.

**Architecture:** A new `src/server/renderAgent/` module runs a job per render: build prompt from zone descriptions → 3 whole-image candidates from the image model → vision-model grading against a rubric → one retry round → pixel-lock outside the curtain mask with `sharp` → store. Express exposes `POST /api/render/jobs` and `GET /api/render/jobs/:id`; the client polls. The canvas renderer stays only as an instant sketch.

**Tech Stack:** Vite + React 19 SPA, Express 4 (`src/server/api.ts`, mounted by `vite.config.ts` in dev and `server.ts` in prod), zod 4, zustand 5, vitest 3 (node env, `src/**/*.test.ts`), OpenRouter `/api/v1/images` and `/api/v1/chat/completions`, `@google/genai` fallback, `sharp` (new dependency).

**Spec:** `docs/superpowers/specs/2026-09-12-render-agent-design.md`

## Global Constraints

- Node 24, TypeScript 5.8, `strict: false`, ESM (`"type": "module"`). Import server files with relative paths and no extension (matches `api.ts`).
- Tests: vitest, node environment, files named `*.test.ts` under `src/`. Run a single file with `npx vitest run <path>`.
- Images travel as data URLs (`data:image/png;base64,...`) everywhere. Express body limit is already 50 MB.
- Grading pass rule: no rubric item below **6**, total at least **35 of 50**. Both are named constants.
- Candidates per round: **3**. Rounds: max **2**.
- Retryable provider errors: HTTP 429, 5xx, network timeout, malformed grader JSON. Retries: **2**, backoff **2 s** then **6 s**.
- Fatal: 401/403, 400, content refusal, missing mask, `NO_WINDOW_DETECTED`.
- Jobs expire **30 minutes** after finishing.
- Poll interval **2 s**.
- Upload guard: warn under **1500 px** width, block under **1000 px**.
- Model env vars: `OPENROUTER_ROOM_VIZ_MODEL` (generate, default `google/gemini-3-pro-image`), `OPENROUTER_VISION_MODEL` (grade, detect, analyze; default `google/gemini-2.5-flash`). Gemini SDK fallback for generate only via `GEMINI_API_KEY` / `GEMINI_IMAGE_MODEL` (default `gemini-3.1-flash-image`).
- Commit after every task with the attribution lines from the session reminder.
- UI copy: the synthetic preview is called **"Sketch"**, the model output **"Rendered"**. Stage copy: "Generating 3 options", "Checking quality", "Locking background".

---

## File Structure

New files (one responsibility each):

| File | Responsibility |
| --- | --- |
| `src/server/images.ts` | `parseBase64Image` moved out of `api.ts` so other server modules can import it without a cycle. |
| `src/server/brandConfigs.ts` | `SERVER_MODEL_CONFIGS` map and `getOrCreateBrandConfig` moved out of `api.ts` for the same reason. |
| `src/server/renderAgent/types.ts` | Job, input, candidate and grade types shared by every stage. |
| `src/server/renderAgent/errors.ts` | `RetryableError`, `FatalError`, `classifyHttpStatus`, `withRetry`. |
| `src/server/renderAgent/prompt.ts` | `buildFabricSwapPrompt`, `buildRoomStagePrompt`, `closestAspectRatio`. Pure. |
| `src/server/renderAgent/grading.ts` | Rubrics, thresholds, `buildGradePrompt`, `parseGrade`, `passes`. Pure. |
| `src/server/renderAgent/lock.ts` | `getImageSize`, `polygonMaskPng`, `bboxMaskPng`, `lockOutsideMask` (sharp). |
| `src/server/renderAgent/imageClient.ts` | `generateImage` (OpenRouter `/images`, Gemini fallback) and `askVision` (multi-image chat). Only file that talks to providers. |
| `src/server/renderAgent/windowDetect.ts` | `detectWindow(roomPhoto, apiKey)` → bbox or `FatalError('NO_WINDOW_DETECTED')`. |
| `src/server/renderAgent/jobs.ts` | In-memory `JobStore` with expiry. |
| `src/server/renderAgent/runner.ts` | `runRenderJob(job, deps)`: the stage orchestration. Deps injected for tests. |
| `src/server/renderAgent/routes.ts` | Express router: validation, quota, start job, status. |
| `src/lib/renderClient.ts` | Browser side: `toDataUrl`, `buildFabricSwapInput`, `startRender`, `pollRender`. |

Modified files:

| File | Change |
| --- | --- |
| `src/server/api.ts` | Import moved helpers; mount render router; delete `/api/room-visualize` and the `single_region` branch of `/api/generate-curtain-fabric`. |
| `src/server/openrouter.ts` | Delete `callOpenRouterInpaint` and `callOpenRouterRoomViz` once nothing imports them. |
| `src/types/curtain.ts` | `CurtainTemplate.curtain_mask_url?: string`. |
| `src/types/brand.ts` | `Design.render_candidates?`, `Design.render_prompt?`, `RoomPreview.candidates?`. |
| `src/utils/fabricRenderer.ts` | `getTemplateRealPhotoUrl` prefers the real photo over the plate. |
| `src/utils/maskedPipeline.ts` | Deleted. |
| `src/components/brand/TemplateEditor.tsx` | Sketch/Rendered states, Render button → job, candidate strip, needs-review. |
| `src/components/brand/DesignDetailView.tsx` | Render and stage via jobs; slider only after success. |
| `src/components/NewTemplateModal.tsx` | Width guard; editable zone description in refine step. |
| `src/components/brand/BrandDashboard.tsx` | Badge copy "Live preview" → "Sketch". |
| `.env.example` | Document the two live model env vars; drop the inpaint one. |

---

### Task 1: Move shared server helpers out of `api.ts`

**Files:**
- Create: `src/server/images.ts`
- Create: `src/server/brandConfigs.ts`
- Modify: `src/server/api.ts:25-45` (remove `parseBase64Image`), `src/server/api.ts:117-171` (remove `SERVER_MODEL_CONFIGS` and `getOrCreateBrandConfig`)
- Test: `src/server/images.test.ts`

**Interfaces:**
- Produces: `parseBase64Image(dataUri: string | undefined): { mimeType: string; base64: string; data: string } | null` from `src/server/images.ts`.
- Produces: `getOrCreateBrandConfig(brandId: string): BrandModelConfig` and `SERVER_MODEL_CONFIGS: Map<string, BrandModelConfig>` from `src/server/brandConfigs.ts`.

- [ ] **Step 1: Write the failing test**

```ts
// src/server/images.test.ts
import { describe, it, expect } from 'vitest';
import { parseBase64Image } from './images';

const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('parseBase64Image', () => {
  it('parses a png data url', () => {
    const r = parseBase64Image(`data:image/png;base64,${PNG_B64}`);
    expect(r?.mimeType).toBe('image/png');
    expect(r?.base64).toBe(PNG_B64);
  });
  it('normalises image/jpg to image/jpeg', () => {
    const r = parseBase64Image(`data:image/jpg;base64,${PNG_B64}`);
    expect(r?.mimeType).toBe('image/jpeg');
  });
  it('rejects svg data urls', () => {
    expect(parseBase64Image('data:image/svg+xml;charset=utf-8,%3Csvg')).toBeNull();
  });
  it('rejects undefined', () => {
    expect(parseBase64Image(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/images.test.ts`
Expected: FAIL, cannot find module `./images`.

- [ ] **Step 3: Create `src/server/images.ts` with the function cut from `api.ts`**

```ts
// src/server/images.ts
/**
 * Extracts clean base64 data and mimeType from a data URI.
 * Returns null for anything that is not a raster PNG/JPEG/WEBP.
 */
export function parseBase64Image(
  dataUri: string | undefined
): { mimeType: string; base64: string; data: string } | null {
  if (!dataUri || typeof dataUri !== 'string') return null;
  const match = dataUri.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+[\r\n]*)$/i);
  if (match) {
    const rawMime = match[1].toLowerCase();
    const mime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
    const b64 = match[3].replace(/\s+/g, '');
    return { mimeType: mime, base64: b64, data: b64 };
  }
  const cleaned = dataUri.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 200) {
    return { mimeType: 'image/jpeg', base64: cleaned, data: cleaned };
  }
  return null;
}
```

- [ ] **Step 4: Create `src/server/brandConfigs.ts`**

Cut the whole `const SERVER_MODEL_CONFIGS: Map<string, BrandModelConfig> = new Map([...])` literal (api.ts lines 117-152) and the `getOrCreateBrandConfig` function (lines 154-171) into this file, then add exports:

```ts
// src/server/brandConfigs.ts
import { BrandModelConfig } from '../types/brand';

export const SERVER_MODEL_CONFIGS: Map<string, BrandModelConfig> = new Map([
  // ... the two seeded entries exactly as they were in api.ts ...
]);

export function getOrCreateBrandConfig(brandId: string): BrandModelConfig {
  let cfg = SERVER_MODEL_CONFIGS.get(brandId);
  if (!cfg) {
    cfg = {
      id: `config-${brandId}-${Date.now()}`,
      brand_id: brandId,
      region_edit_provider: 'flux_kontext',
      room_preview_provider: 'nano_banana_pro',
      key_mode: 'platform_managed',
      byo_api_key_encrypted: null,
      byo_provider: null,
      monthly_generation_cap: 200,
      monthly_generations_used: 0,
      updated_at: new Date().toISOString(),
      updated_by_user_id: 'system',
    };
    SERVER_MODEL_CONFIGS.set(brandId, cfg);
  }
  return cfg;
}
```

- [ ] **Step 5: Update `api.ts` imports**

Delete the removed code from `api.ts` and add at the top, after the express import:

```ts
import { parseBase64Image } from './images';
import { SERVER_MODEL_CONFIGS, getOrCreateBrandConfig } from './brandConfigs';
```

- [ ] **Step 6: Run tests and type check**

Run: `npx vitest run src/server/images.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/server/images.ts src/server/images.test.ts src/server/brandConfigs.ts src/server/api.ts
git commit -m "refactor(server): move parseBase64Image and brand configs into shared modules"
```

---

### Task 2: Render agent types and error classes

**Files:**
- Create: `src/server/renderAgent/types.ts`
- Create: `src/server/renderAgent/errors.ts`
- Test: `src/server/renderAgent/errors.test.ts`

**Interfaces:**
- Produces every type below; later tasks import them by name.
- Produces `RetryableError`, `FatalError`, `classifyHttpStatus(status: number, body: string): RetryableError | FatalError`, `withRetry<T>(fn: () => Promise<T>, opts?: { retries?: number; delaysMs?: number[]; sleep?: (ms: number) => Promise<void> }): Promise<T>`.

- [ ] **Step 1: Write `types.ts`**

```ts
// src/server/renderAgent/types.ts
export type RenderJobKind = 'fabric_swap' | 'room_stage';
export type JobStatus = 'queued' | 'running' | 'done' | 'needs_review' | 'failed';
export type JobStage = 'prompt' | 'generate' | 'grade' | 'lock' | 'store';

export interface Bbox { x: number; y: number; width: number; height: number } // percent 0-100

export interface ZoneInput {
  id: string;
  display_name: string;
  description: string;
  location: string;
  polygon_coords: Array<{ x: number; y: number }>; // percent
}

export interface ZoneChange {
  regionId: string;
  fabricName: string;
  weave: string;
  colorHex: string;
  category: string;
  swatch: string; // data URL, raster
}

export interface FabricSwapInput {
  kind: 'fabric_swap';
  brandId: string;
  templateName: string;
  templatePhoto: string; // data URL, raster
  zones: ZoneInput[];
  changes: ZoneChange[];
  curtainMask?: string; // optional data URL override; derived from polygons when absent
}

export interface RoomStageInput {
  kind: 'room_stage';
  brandId: string;
  roomPhoto: string; // data URL
  curtainImage: string; // data URL
}

export type RenderJobInput = FabricSwapInput | RoomStageInput;

export interface GradeItem { key: string; score: number; reason: string }

export interface Candidate {
  id: string;
  round: number;
  image: string; // data URL
  scores: GradeItem[];
  total: number;
  passed: boolean;
}

export interface RenderResult {
  finalImage: string;
  chosenId: string;
  prompt: string;
  candidates: Candidate[];
}

export interface RenderJob {
  id: string;
  kind: RenderJobKind;
  brandId: string;
  status: JobStatus;
  stage: JobStage;
  round: number;
  candidates: Candidate[];
  result?: RenderResult;
  error?: string;
  createdAt: number;
  finishedAt?: number;
  input: RenderJobInput;
  apiKey: string | null;
}

export interface BuiltPrompt { text: string; images: string[] }
```

- [ ] **Step 2: Write the failing test for errors**

```ts
// src/server/renderAgent/errors.test.ts
import { describe, it, expect, vi } from 'vitest';
import { RetryableError, FatalError, classifyHttpStatus, withRetry } from './errors';

describe('classifyHttpStatus', () => {
  it('429 and 5xx are retryable', () => {
    expect(classifyHttpStatus(429, 'slow down')).toBeInstanceOf(RetryableError);
    expect(classifyHttpStatus(503, 'down')).toBeInstanceOf(RetryableError);
  });
  it('401, 403 and 400 are fatal', () => {
    expect(classifyHttpStatus(401, '')).toBeInstanceOf(FatalError);
    expect(classifyHttpStatus(403, '')).toBeInstanceOf(FatalError);
    expect(classifyHttpStatus(400, 'bad')).toBeInstanceOf(FatalError);
  });
  it('keeps the status and a trimmed body in the message', () => {
    const e = classifyHttpStatus(500, 'x'.repeat(500));
    expect(e.message).toContain('500');
    expect(e.message.length).toBeLessThan(260);
  });
});

describe('withRetry', () => {
  it('retries a RetryableError up to the limit then succeeds', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new RetryableError('flaky');
      return 'ok';
    });
    const sleep = vi.fn(async () => undefined);
    await expect(withRetry(fn, { retries: 2, delaysMs: [1, 2], sleep })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(1);
    expect(sleep).toHaveBeenCalledWith(2);
  });
  it('gives up after the limit', async () => {
    const fn = vi.fn(async () => { throw new RetryableError('flaky'); });
    await expect(withRetry(fn, { retries: 2, sleep: async () => undefined })).rejects.toBeInstanceOf(RetryableError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it('does not retry a FatalError', async () => {
    const fn = vi.fn(async () => { throw new FatalError('nope'); });
    await expect(withRetry(fn, { sleep: async () => undefined })).rejects.toBeInstanceOf(FatalError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('treats unknown errors as retryable', async () => {
    let calls = 0;
    const fn = vi.fn(async () => { if (++calls === 1) throw new Error('ECONNRESET'); return 1; });
    await expect(withRetry(fn, { sleep: async () => undefined })).resolves.toBe(1);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/errors.test.ts`
Expected: FAIL, cannot find module `./errors`.

- [ ] **Step 4: Write `errors.ts`**

```ts
// src/server/renderAgent/errors.ts
export class RetryableError extends Error {
  readonly kind = 'retryable' as const;
  constructor(message: string) { super(message); this.name = 'RetryableError'; }
}

export class FatalError extends Error {
  readonly kind = 'fatal' as const;
  readonly code?: string;
  constructor(message: string, code?: string) { super(message); this.name = 'FatalError'; this.code = code; }
}

export const RETRY_LIMIT = 2;
export const RETRY_DELAYS_MS = [2000, 6000];

export function classifyHttpStatus(status: number, body: string): RetryableError | FatalError {
  const snippet = (body || '').replace(/\s+/g, ' ').slice(0, 200);
  const message = `Provider HTTP ${status}: ${snippet}`;
  if (status === 429 || status >= 500) return new RetryableError(message);
  return new FatalError(message, status === 401 || status === 403 ? 'BAD_KEY' : 'BAD_REQUEST');
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; delaysMs?: number[]; sleep?: (ms: number) => Promise<void> } = {}
): Promise<T> {
  const retries = opts.retries ?? RETRY_LIMIT;
  const delays = opts.delaysMs ?? RETRY_DELAYS_MS;
  const sleep = opts.sleep ?? defaultSleep;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof FatalError) throw err;
      if (attempt >= retries) throw err;
      await sleep(delays[Math.min(attempt, delays.length - 1)] ?? 0);
      attempt++;
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/errors.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/server/renderAgent/types.ts src/server/renderAgent/errors.ts src/server/renderAgent/errors.test.ts
git commit -m "feat(render-agent): job types and retry/fatal error classes"
```

---

### Task 3: Prompt builders

**Files:**
- Create: `src/server/renderAgent/prompt.ts`
- Test: `src/server/renderAgent/prompt.test.ts`

**Interfaces:**
- Consumes `FabricSwapInput`, `RoomStageInput`, `Bbox`, `BuiltPrompt` from `./types`.
- Produces `buildFabricSwapPrompt(input: FabricSwapInput, previousProblems?: string[]): BuiltPrompt`, `buildRoomStagePrompt(input: RoomStageInput, windowBbox: Bbox, previousProblems?: string[]): BuiltPrompt`, `closestAspectRatio(width: number, height: number): string`.

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/prompt.test.ts`
Expected: FAIL, cannot find module `./prompt`.

- [ ] **Step 3: Write `prompt.ts`**

```ts
// src/server/renderAgent/prompt.ts
import type { BuiltPrompt, FabricSwapInput, RoomStageInput, Bbox, ZoneInput } from './types';

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

  const instructions = changed
    .map(({ change, zone }, i) =>
      `Replace the ${zoneLabel(zone)} entirely with the fabric in Image ${i + 2} (${change.fabricName}, ${change.weave}, colour ${change.colorHex}). The fabric must fall into the existing pleats and folds. Pattern repeat about 1/20 of the curtain height. Keep the original lighting, shadows and highlights.`
    )
    .join('\n\n');

  const untouchedClause = untouched.length
    ? `Leave these zones exactly as they are in Image 1: ${untouched.map(zoneLabel).join('; ')}.\n`
    : '';

  const text =
    `Edit Image 1, a photograph of a curtain, by changing the fabric of specific zones. Return one photograph with the same framing.\n\n` +
    `${legend}\n\n${instructions}\n\n${untouchedClause}${PRESERVE_TAIL}` +
    problemsTail(previousProblems);

  return { text, images: [input.templatePhoto, ...changed.map(({ change }) => change.swatch)] };
}

export function buildRoomStagePrompt(input: RoomStageInput, windowBbox: Bbox, previousProblems?: string[]): BuiltPrompt {
  const r = (n: number) => Math.round(n);
  const x2 = r(windowBbox.x + windowBbox.width);
  const y2 = r(windowBbox.y + windowBbox.height);
  const text =
    `Edit Image 1, a photograph of a real room, by hanging the curtains shown in Image 2 on its window. Return one photograph with the same framing.\n\n` +
    `Image 1: the room photograph.\nImage 2: the curtain design to hang.\n\n` +
    `The window occupies roughly x ${r(windowBbox.x)}-${x2}%, y ${r(windowBbox.y)}-${y2}% of Image 1. Mount the curtains from Image 2 across that window from ceiling to floor at a plausible scale, keeping their fabrics, bands and pleats exactly as shown. Match the room's daylight and cast soft contact shadows on the floor.\n\n` +
    `Keep the furniture, floor, walls, ceiling, lighting and everything outside the window exactly as in Image 1. No text, no watermark, no added objects, no change of camera angle or crop.` +
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/prompt.test.ts`
Expected: PASS (8 tests). If an exact-text test fails, fix the implementation, not the test: the test text is the spec.

- [ ] **Step 5: Commit**

```bash
git add src/server/renderAgent/prompt.ts src/server/renderAgent/prompt.test.ts
git commit -m "feat(render-agent): prompt builders for fabric swap and room staging"
```

---

### Task 4: Grading rubric and parser

**Files:**
- Create: `src/server/renderAgent/grading.ts`
- Test: `src/server/renderAgent/grading.test.ts`

**Interfaces:**
- Consumes `GradeItem`, `RenderJobKind`, `FabricSwapInput` from `./types`.
- Produces `MIN_ITEM_SCORE = 6`, `MIN_TOTAL_SCORE = 35`, `RUBRICS: Record<RenderJobKind, Array<{ key: string; question: string }>>`, `buildGradePrompt(kind, context: { changes?: Array<{ zoneName: string; fabricName: string }> }): { text: string }`, `gradeImages(kind, original, swatches, candidate): string[]`, `parseGrade(raw: string, kind): GradeItem[]` (throws `RetryableError` on malformed), `passes(items: GradeItem[]): boolean`, `total(items): number`, `reasonsBelowThreshold(items): string[]`.

- [ ] **Step 1: Write the failing test**

```ts
// src/server/renderAgent/grading.test.ts
import { describe, it, expect } from 'vitest';
import { buildGradePrompt, gradeImages, parseGrade, passes, total, reasonsBelowThreshold, RUBRICS, MIN_ITEM_SCORE, MIN_TOTAL_SCORE } from './grading';
import { RetryableError } from './errors';

const good = RUBRICS.fabric_swap.map((r) => ({ key: r.key, score: 8, reason: 'fine' }));

describe('rubrics', () => {
  it('fabric swap has the five spec items in order', () => {
    expect(RUBRICS.fabric_swap.map((r) => r.key)).toEqual(['target_zones', 'other_zones_unchanged', 'pleats_lighting', 'no_artifacts', 'swatch_likeness']);
  });
  it('room stage swaps the first two items', () => {
    expect(RUBRICS.room_stage.map((r) => r.key)).toEqual(['window_mounted', 'room_unchanged', 'pleats_lighting', 'no_artifacts', 'swatch_likeness']);
  });
  it('thresholds match the spec', () => {
    expect(MIN_ITEM_SCORE).toBe(6);
    expect(MIN_TOTAL_SCORE).toBe(35);
  });
});

describe('buildGradePrompt', () => {
  it('names the changed zones and asks for JSON only', () => {
    const { text } = buildGradePrompt('fabric_swap', { changes: [{ zoneName: 'Upper header', fabricName: 'Denim Floral' }] });
    expect(text).toContain('Upper header should now show Denim Floral (Image 2)');
    expect(text).toContain('"items"');
    expect(text.trim().endsWith('Output valid JSON only.')).toBe(true);
  });
  it('orders images original, swatches, candidate', () => {
    expect(gradeImages('fabric_swap', 'o', ['s1', 's2'], 'c')).toEqual(['o', 's1', 's2', 'c']);
  });
});

describe('parseGrade', () => {
  it('parses a fenced json reply and keeps rubric order', () => {
    const raw = '```json\n' + JSON.stringify({ items: [...good].reverse() }) + '\n```';
    const items = parseGrade(raw, 'fabric_swap');
    expect(items.map((i) => i.key)).toEqual(RUBRICS.fabric_swap.map((r) => r.key));
  });
  it('clamps scores to 0-10', () => {
    const raw = JSON.stringify({ items: good.map((g) => ({ ...g, score: 14 })) });
    expect(parseGrade(raw, 'fabric_swap').every((i) => i.score === 10)).toBe(true);
  });
  it('throws RetryableError when an item is missing', () => {
    const raw = JSON.stringify({ items: good.slice(1) });
    expect(() => parseGrade(raw, 'fabric_swap')).toThrow(RetryableError);
  });
  it('throws RetryableError on non-json', () => {
    expect(() => parseGrade('looks great!', 'fabric_swap')).toThrow(RetryableError);
  });
});

describe('passes', () => {
  it('passes when every item >= 6 and total >= 35', () => {
    expect(passes(good)).toBe(true);
    expect(total(good)).toBe(40);
  });
  it('fails on one item below 6 even with a high total', () => {
    const items = good.map((g, i) => (i === 0 ? { ...g, score: 5 } : { ...g, score: 10 }));
    expect(passes(items)).toBe(false);
    expect(reasonsBelowThreshold(items)).toEqual(['target_zones: fine']);
  });
  it('fails on total below 35', () => {
    expect(passes(good.map((g) => ({ ...g, score: 6 })))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/grading.test.ts`
Expected: FAIL, cannot find module `./grading`.

- [ ] **Step 3: Write `grading.ts`**

```ts
// src/server/renderAgent/grading.ts
import type { GradeItem, RenderJobKind } from './types';
import { RetryableError } from './errors';

export const MIN_ITEM_SCORE = 6;
export const MIN_TOTAL_SCORE = 35;

const SHARED = [
  { key: 'pleats_lighting', question: 'Do folds, pleats, shadows and highlights follow the original photograph?' },
  { key: 'no_artifacts', question: 'Is the image free of text, watermarks, added objects, and warped rod, wall, floor or furniture?' },
  { key: 'swatch_likeness', question: 'Does the new fabric resemble its swatch in colour, pattern and scale?' },
];

export const RUBRICS: Record<RenderJobKind, Array<{ key: string; question: string }>> = {
  fabric_swap: [
    { key: 'target_zones', question: 'Is the intended fabric on the intended zones, and nowhere else?' },
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
  context: { changes?: Array<{ zoneName: string; fabricName: string }> }
): { text: string } {
  const changes = context.changes ?? [];
  const legend =
    kind === 'fabric_swap'
      ? ['Image 1: the original curtain photograph.']
          .concat(changes.map((c, i) => `Image ${i + 2}: swatch of ${c.fabricName}.`))
          .concat([`Image ${changes.length + 2}: the candidate render to grade.`])
      : ['Image 1: the original room photograph.', 'Image 2: the curtain design that should be hung.', 'Image 3: the candidate render to grade.'];
  const expectation =
    kind === 'fabric_swap'
      ? changes.map((c, i) => `${c.zoneName} should now show ${c.fabricName} (Image ${i + 2}).`).join(' ')
      : 'The curtains from Image 2 should hang on the window of Image 1.';
  const items = RUBRICS[kind].map((r) => `- "${r.key}": ${r.question}`).join('\n');
  const schema = JSON.stringify({ items: RUBRICS[kind].map((r) => ({ key: r.key, score: 0, reason: '' })) });
  const text =
    `You are a strict photo retoucher grading an AI edit.\n\n${legend.join('\n')}\n\nExpected change: ${expectation}\n\n` +
    `Score each item from 0 (unacceptable) to 10 (perfect) and give a one-sentence reason:\n${items}\n\n` +
    `Reply with exactly this JSON shape: ${schema}\nOutput valid JSON only.`;
  return { text };
}

export function gradeImages(kind: RenderJobKind, original: string, swatches: string[], candidate: string): string[] {
  return kind === 'fabric_swap' ? [original, ...swatches, candidate] : [original, ...swatches, candidate];
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
  return items.every((i) => i.score >= MIN_ITEM_SCORE) && total(items) >= MIN_TOTAL_SCORE;
}

export function reasonsBelowThreshold(items: GradeItem[]): string[] {
  return items.filter((i) => i.score < MIN_ITEM_SCORE).map((i) => `${i.key}: ${i.reason}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/grading.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/server/renderAgent/grading.ts src/server/renderAgent/grading.test.ts
git commit -m "feat(render-agent): grading rubric, prompt and parser"
```

---

### Task 5: Masks and pixel lock with sharp

**Files:**
- Modify: `package.json` (add `sharp`)
- Create: `src/server/renderAgent/lock.ts`
- Test: `src/server/renderAgent/lock.test.ts`

**Interfaces:**
- Consumes `Bbox`, `ZoneInput` from `./types`.
- Produces `getImageSize(dataUrl: string): Promise<{ width: number; height: number }>`, `polygonMaskPng(zones: ZoneInput[], width, height, featherPx = 6): Promise<string>` (data URL, white inside), `bboxMaskPng(bbox: Bbox, width, height, expandPct = 15, featherPx = 6): Promise<string>`, `lockOutsideMask(original: string, candidate: string, mask: string): Promise<string>`, `pixelAt(dataUrl, x, y): Promise<[number, number, number]>` (test helper, exported).

- [ ] **Step 1: Install sharp**

Run: `npm i sharp@^0.34`
Expected: installs without a build step (prebuilt binary). Confirm with `node -e "require('sharp'); console.log('ok')"`.

- [ ] **Step 2: Write the failing test**

```ts
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
  it('resizes a candidate of a different size to the original', async () => {
    const original = await solid(40, 40, [255, 0, 0]);
    const candidate = await solid(80, 80, [0, 0, 255]);
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/lock.test.ts`
Expected: FAIL, cannot find module `./lock`.

- [ ] **Step 4: Write `lock.ts`**

```ts
// src/server/renderAgent/lock.ts
import sharp from 'sharp';
import type { Bbox, ZoneInput } from './types';
import { FatalError } from './errors';

function toBuffer(dataUrl: string): Buffer {
  const i = dataUrl.indexOf('base64,');
  if (i < 0) throw new FatalError('Expected a base64 data URL', 'BAD_REQUEST');
  return Buffer.from(dataUrl.slice(i + 7), 'base64');
}

function toDataUrl(png: Buffer): string {
  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  const meta = await sharp(toBuffer(dataUrl)).metadata();
  if (!meta.width || !meta.height) throw new FatalError('Could not read image size', 'BAD_REQUEST');
  return { width: meta.width, height: meta.height };
}

async function rasterizeMaskSvg(svg: string, featherPx: number): Promise<string> {
  let img = sharp(Buffer.from(svg)).grayscale();
  if (featherPx > 0) img = img.blur(featherPx);
  return toDataUrl(await img.png().toBuffer());
}

export async function polygonMaskPng(zones: ZoneInput[], width: number, height: number, featherPx = 6): Promise<string> {
  const polys = zones
    .filter((z) => z.polygon_coords && z.polygon_coords.length >= 3)
    .map((z) => `<polygon fill="white" points="${z.polygon_coords.map((p) => `${(p.x / 100) * width},${(p.y / 100) * height}`).join(' ')}"/>`)
    .join('');
  if (!polys) throw new FatalError('Template has no zone polygons to build a curtain mask from', 'NO_MASK');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/>${polys}</svg>`;
  return rasterizeMaskSvg(svg, featherPx);
}

export async function bboxMaskPng(bbox: Bbox, width: number, height: number, expandPct = 15, featherPx = 6): Promise<string> {
  const ex = (bbox.width * expandPct) / 100;
  const ey = (bbox.height * expandPct) / 100;
  const x1 = Math.max(0, bbox.x - ex);
  const y1 = Math.max(0, bbox.y - ey);
  const x2 = Math.min(100, bbox.x + bbox.width + ex);
  const y2 = Math.min(100, bbox.y + bbox.height + ey);
  const rect = `<rect fill="white" x="${(x1 / 100) * width}" y="${(y1 / 100) * height}" width="${((x2 - x1) / 100) * width}" height="${((y2 - y1) / 100) * height}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/>${rect}</svg>`;
  return rasterizeMaskSvg(svg, featherPx);
}

/** Composite `candidate` over `original` using `mask` (white = take candidate). Output has original's size. */
export async function lockOutsideMask(original: string, candidate: string, mask: string): Promise<string> {
  const { width, height } = await getImageSize(original);
  const maskGrey = await sharp(toBuffer(mask)).resize(width, height, { fit: 'fill' }).grayscale().toColourspace('b-w').raw().toBuffer();
  const candidateRgb = await sharp(toBuffer(candidate)).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const candidateRgba = await sharp(candidateRgb, { raw: { width, height, channels: 3 } })
    .joinChannel(maskGrey, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  const out = await sharp(toBuffer(original)).removeAlpha().composite([{ input: candidateRgba, blend: 'over' }]).png().toBuffer();
  return toDataUrl(out);
}

export async function pixelAt(dataUrl: string, x: number, y: number): Promise<[number, number, number]> {
  const { data, info } = await sharp(toBuffer(dataUrl)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/lock.test.ts`
Expected: PASS (6 tests). If `joinChannel` rejects the raw buffer on the installed sharp version, replace the two lines building `candidateRgba` with: `sharp(candidateRgb, { raw: { width, height, channels: 3 } }).joinChannel(await sharp(maskGrey, { raw: { width, height, channels: 1 } }).png().toBuffer()).png().toBuffer()` and rerun.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/server/renderAgent/lock.ts src/server/renderAgent/lock.test.ts
git commit -m "feat(render-agent): polygon and bbox masks and pixel lock with sharp"
```

---

### Task 6: Provider client for image generation and vision

**Files:**
- Create: `src/server/renderAgent/imageClient.ts`
- Test: `src/server/renderAgent/imageClient.test.ts`

**Interfaces:**
- Consumes `classifyHttpStatus`, `RetryableError`, `FatalError` from `./errors`; `getEffectiveOpenRouterKey`, `OPENROUTER_RECOMMENDED_MODELS` from `../openrouter`; `parseBase64Image` from `../images`.
- Produces `generateImage(req: GenerateRequest, deps?: ClientDeps): Promise<string>` and `askVision(req: VisionRequest, deps?: ClientDeps): Promise<string>`, plus `GENERATE_MODEL`, `VISION_MODEL` resolved from env.

```ts
export interface GenerateRequest { prompt: string; images: string[]; aspectRatio: string; seed: number; apiKey: string | null }
export interface VisionRequest { prompt: string; images: string[]; apiKey: string | null }
export interface ClientDeps { fetch?: typeof fetch; geminiFallback?: (req: GenerateRequest) => Promise<string> }
```

- [ ] **Step 1: Write the failing test**

```ts
// src/server/renderAgent/imageClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateImage, askVision } from './imageClient';
import { FatalError, RetryableError } from './errors';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const ok = (body: any) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }) as any;
const fail = (status: number, text = 'err') => ({ ok: false, status, json: async () => ({}), text: async () => text }) as any;

describe('generateImage', () => {
  it('posts to /images with object-shaped input_references, seed and resolution, and returns a data url', async () => {
    const fetchMock = vi.fn(async () => ok({ data: [{ b64_json: 'AAAA', media_type: 'image/png' }] }));
    const out = await generateImage({ prompt: 'p', images: [PNG, PNG], aspectRatio: '4:5', seed: 7, apiKey: 'k' }, { fetch: fetchMock });
    expect(out).toBe('data:image/png;base64,AAAA');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/images');
    const body = JSON.parse(init.body);
    expect(body.input_references).toEqual([{ type: 'image_url', image_url: { url: PNG } }, { type: 'image_url', image_url: { url: PNG } }]);
    expect(body.seed).toBe(7);
    expect(body.resolution).toBe('2K');
    expect(body.aspect_ratio).toBe('4:5');
    expect(body.n).toBe(1);
    expect(init.headers.Authorization).toBe('Bearer k');
  });
  it('maps 429 to RetryableError and 401 to FatalError', async () => {
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: 'k' }, { fetch: vi.fn(async () => fail(429)) })).rejects.toBeInstanceOf(RetryableError);
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: 'k' }, { fetch: vi.fn(async () => fail(401)) })).rejects.toBeInstanceOf(FatalError);
  });
  it('treats an empty data array as retryable', async () => {
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: 'k' }, { fetch: vi.fn(async () => ok({ data: [] })) })).rejects.toBeInstanceOf(RetryableError);
  });
  it('uses the gemini fallback when there is no OpenRouter key', async () => {
    const prev = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      const geminiFallback = vi.fn(async () => PNG);
      const out = await generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: null }, { fetch: vi.fn(), geminiFallback });
      expect(out).toBe(PNG);
      expect(geminiFallback).toHaveBeenCalledTimes(1);
    } finally {
      if (prev) process.env.OPENROUTER_API_KEY = prev;
    }
  });
});

describe('askVision', () => {
  it('sends text plus every image and returns the content string', async () => {
    const fetchMock = vi.fn(async () => ok({ choices: [{ message: { content: '{"items":[]}' } }] }));
    const out = await askVision({ prompt: 'grade', images: [PNG, PNG, PNG], apiKey: 'k' }, { fetch: fetchMock });
    expect(out).toBe('{"items":[]}');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].content).toHaveLength(4);
    expect(body.messages[0].content[0]).toEqual({ type: 'text', text: 'grade' });
    expect(body.messages[0].content[3]).toEqual({ type: 'image_url', image_url: { url: PNG } });
    expect(body.temperature).toBe(0.1);
  });
  it('joins array content parts', async () => {
    const fetchMock = vi.fn(async () => ok({ choices: [{ message: { content: [{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }] } }] }));
    expect(await askVision({ prompt: 'x', images: [], apiKey: 'k' }, { fetch: fetchMock })).toBe('ab');
  });
  it('throws FatalError when no key resolves', async () => {
    const prev = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      await expect(askVision({ prompt: 'x', images: [], apiKey: null }, { fetch: vi.fn() })).rejects.toBeInstanceOf(FatalError);
    } finally {
      if (prev) process.env.OPENROUTER_API_KEY = prev;
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/imageClient.test.ts`
Expected: FAIL, cannot find module `./imageClient`.

- [ ] **Step 3: Write `imageClient.ts`**

```ts
// src/server/renderAgent/imageClient.ts
import { GoogleGenAI } from '@google/genai';
import { getEffectiveOpenRouterKey, OPENROUTER_RECOMMENDED_MODELS } from '../openrouter';
import { parseBase64Image } from '../images';
import { classifyHttpStatus, FatalError, RetryableError } from './errors';

const BASE = 'https://openrouter.ai/api/v1';
export const GENERATE_MODEL = process.env.OPENROUTER_ROOM_VIZ_MODEL || OPENROUTER_RECOMMENDED_MODELS.roomVizArchitectural;
export const VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || OPENROUTER_RECOMMENDED_MODELS.vision;

export interface GenerateRequest { prompt: string; images: string[]; aspectRatio: string; seed: number; apiKey: string | null }
export interface VisionRequest { prompt: string; images: string[]; apiKey: string | null }
export interface ClientDeps { fetch?: typeof fetch; geminiFallback?: (req: GenerateRequest) => Promise<string> }

function headers(key: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://aatmi.design', 'X-Title': 'Aatmi Curtain Studio' };
}

export async function generateImage(req: GenerateRequest, deps: ClientDeps = {}): Promise<string> {
  const doFetch = deps.fetch ?? fetch;
  const key = getEffectiveOpenRouterKey(req.apiKey);
  if (!key) {
    const fallback = deps.geminiFallback ?? geminiGenerate;
    return fallback(req);
  }
  const body = {
    model: GENERATE_MODEL,
    prompt: req.prompt,
    n: 1,
    seed: req.seed,
    resolution: '2K',
    aspect_ratio: req.aspectRatio,
    output_format: 'png',
    input_references: req.images.map((url) => ({ type: 'image_url', image_url: { url } })),
  };
  const res = await doFetch(`${BASE}/images`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const first = data?.data?.[0];
  if (first?.b64_json) return `data:${first.media_type || 'image/png'};base64,${first.b64_json}`;
  if (first?.url) return first.url;
  throw new RetryableError('Image model returned no image');
}

export async function askVision(req: VisionRequest, deps: ClientDeps = {}): Promise<string> {
  const doFetch = deps.fetch ?? fetch;
  const key = getEffectiveOpenRouterKey(req.apiKey);
  if (!key) throw new FatalError('OPENROUTER_API_KEY is not configured', 'BAD_KEY');
  const body = {
    model: VISION_MODEL,
    temperature: 0.1,
    messages: [{ role: 'user', content: [{ type: 'text', text: req.prompt }, ...req.images.map((url) => ({ type: 'image_url', image_url: { url } }))] }],
  };
  const res = await doFetch(`${BASE}/chat/completions`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((p: any) => (p?.type === 'text' ? p.text : '')).join('');
  throw new RetryableError('Vision model returned no content');
}

async function geminiGenerate(req: GenerateRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new FatalError('No OPENROUTER_API_KEY or GEMINI_API_KEY configured', 'BAD_KEY');
  const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  const parts: any[] = [];
  for (const img of req.images) {
    const p = parseBase64Image(img);
    if (!p) throw new FatalError('Reference image is not a raster data URL', 'BAD_REQUEST');
    parts.push({ inlineData: { data: p.base64, mimeType: p.mimeType } });
  }
  parts.push({ text: req.prompt });
  const resp = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image',
    config: { imageConfig: { aspectRatio: req.aspectRatio, imageSize: '2K' } },
    contents: { parts },
  });
  for (const part of resp.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  }
  throw new RetryableError('Gemini returned no image');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/imageClient.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/server/renderAgent/imageClient.ts src/server/renderAgent/imageClient.test.ts
git commit -m "feat(render-agent): OpenRouter image and vision client with correct reference format"
```

---

### Task 7: Window detection

**Files:**
- Create: `src/server/renderAgent/windowDetect.ts`
- Test: `src/server/renderAgent/windowDetect.test.ts`

**Interfaces:**
- Consumes `askVision`, `VisionRequest` from `./imageClient`; `Bbox` from `./types`; `FatalError`, `RetryableError` from `./errors`.
- Produces `detectWindow(roomPhoto: string, apiKey: string | null, ask?: (req: VisionRequest) => Promise<string>): Promise<Bbox>` and `WINDOW_DETECT_PROMPT`.

- [ ] **Step 1: Write the failing test**

```ts
// src/server/renderAgent/windowDetect.test.ts
import { describe, it, expect, vi } from 'vitest';
import { detectWindow } from './windowDetect';
import { FatalError, RetryableError } from './errors';

describe('detectWindow', () => {
  it('returns the bbox from the model', async () => {
    const ask = vi.fn(async () => '```json\n{"hasWindow":true,"bbox":{"x":30,"y":10,"width":40,"height":80}}\n```');
    await expect(detectWindow('data:image/png;base64,x', 'k', ask)).resolves.toEqual({ x: 30, y: 10, width: 40, height: 80 });
    expect(ask.mock.calls[0][0].images).toEqual(['data:image/png;base64,x']);
  });
  it('throws a fatal NO_WINDOW_DETECTED when hasWindow is false', async () => {
    const err = await detectWindow('d', 'k', async () => '{"hasWindow":false}').catch((e) => e);
    expect(err).toBeInstanceOf(FatalError);
    expect(err.code).toBe('NO_WINDOW_DETECTED');
  });
  it('throws retryable on malformed JSON', async () => {
    await expect(detectWindow('d', 'k', async () => 'nope')).rejects.toBeInstanceOf(RetryableError);
  });
  it('clamps the bbox into 0-100', async () => {
    await expect(detectWindow('d', 'k', async () => '{"hasWindow":true,"bbox":{"x":-5,"y":0,"width":120,"height":50}}')).resolves.toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/windowDetect.test.ts`
Expected: FAIL, cannot find module `./windowDetect`.

- [ ] **Step 3: Write `windowDetect.ts`**

```ts
// src/server/renderAgent/windowDetect.ts
import { askVision, VisionRequest } from './imageClient';
import { FatalError, RetryableError } from './errors';
import type { Bbox } from './types';

export const WINDOW_DETECT_PROMPT =
  'Locate the window or curtain area in this room photo. If a window is visible, return a JSON object: {"hasWindow": true, "bbox": {"x": number, "y": number, "width": number, "height": number}} with values as percentages of the image from 0 to 100. If no window exists, return {"hasWindow": false}. Output valid JSON only.';

export const NO_WINDOW_MESSAGE = "We couldn't find a window in this photo. Try a clearer shot of the wall with the window.";

export async function detectWindow(
  roomPhoto: string,
  apiKey: string | null,
  ask: (req: VisionRequest) => Promise<string> = askVision
): Promise<Bbox> {
  const raw = await ask({ prompt: WINDOW_DETECT_PROMPT, images: [roomPhoto], apiKey });
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new RetryableError(`Window detector returned non-JSON: ${cleaned.slice(0, 120)}`);
  }
  if (parsed?.hasWindow === false) throw new FatalError(NO_WINDOW_MESSAGE, 'NO_WINDOW_DETECTED');
  const b = parsed?.bbox;
  if (!b || [b.x, b.y, b.width, b.height].some((n) => typeof n !== 'number')) throw new RetryableError('Window detector returned no bbox');
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const x = clamp(b.x);
  const y = clamp(b.y);
  return { x, y, width: clamp(b.width) - Math.max(0, x + clamp(b.width) - 100), height: clamp(b.height) - Math.max(0, y + clamp(b.height) - 100) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/windowDetect.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/server/renderAgent/windowDetect.ts src/server/renderAgent/windowDetect.test.ts
git commit -m "feat(render-agent): window detection with fatal no-window error"
```

---

### Task 8: Job store and runner

**Files:**
- Create: `src/server/renderAgent/jobs.ts`
- Create: `src/server/renderAgent/runner.ts`
- Test: `src/server/renderAgent/runner.test.ts`

**Interfaces:**
- Consumes everything from Tasks 2 to 7.
- Produces `JobStore` (`create(input, apiKey): RenderJob`, `get(id): RenderJob | undefined`, `finish(job)`, `publicView(job)`), `CANDIDATES_PER_ROUND = 3`, `MAX_ROUNDS = 2`, `JOB_TTL_MS = 30 * 60 * 1000`, `RunnerDeps`, `runRenderJob(job: RenderJob, deps?: Partial<RunnerDeps>): Promise<RenderJob>`.

```ts
export interface RunnerDeps {
  generate: (req: GenerateRequest) => Promise<string>;
  ask: (req: VisionRequest) => Promise<string>;
  detectWindow: (roomPhoto: string, apiKey: string | null) => Promise<Bbox>;
  sleep: (ms: number) => Promise<void>;
  onUpdate?: (job: RenderJob) => void;
}
```

- [ ] **Step 1: Write `jobs.ts`**

```ts
// src/server/renderAgent/jobs.ts
import type { RenderJob, RenderJobInput } from './types';

export const JOB_TTL_MS = 30 * 60 * 1000;

export class JobStore {
  private jobs = new Map<string, RenderJob>();
  private timers = new Map<string, NodeJS.Timeout>();

  create(input: RenderJobInput, apiKey: string | null): RenderJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const job: RenderJob = { id, kind: input.kind, brandId: input.brandId, status: 'queued', stage: 'prompt', round: 0, candidates: [], createdAt: Date.now(), input, apiKey };
    this.jobs.set(id, job);
    return job;
  }

  get(id: string): RenderJob | undefined {
    return this.jobs.get(id);
  }

  /** Marks the job finished and schedules its removal after JOB_TTL_MS. */
  finish(job: RenderJob, ttlMs = JOB_TTL_MS): void {
    job.finishedAt = Date.now();
    const t = setTimeout(() => { this.jobs.delete(job.id); this.timers.delete(job.id); }, ttlMs);
    if (typeof t.unref === 'function') t.unref();
    this.timers.set(job.id, t);
  }

  /** What the GET endpoint returns: no input images, no api key. */
  publicView(job: RenderJob) {
    return { id: job.id, kind: job.kind, status: job.status, stage: job.stage, round: job.round, candidates: job.candidates, result: job.result, error: job.error };
  }

  size(): number { return this.jobs.size; }
}

export const jobStore = new JobStore();
```

- [ ] **Step 2: Write the failing runner test**

```ts
// src/server/renderAgent/runner.test.ts
import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import { runRenderJob, CANDIDATES_PER_ROUND, MAX_ROUNDS } from './runner';
import { JobStore } from './jobs';
import { RUBRICS } from './grading';
import { FatalError, RetryableError } from './errors';
import type { FabricSwapInput, RoomStageInput } from './types';

async function solid(w: number, h: number, rgb: [number, number, number]): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const gradeReply = (score: number) => JSON.stringify({ items: RUBRICS.fabric_swap.map((r) => ({ key: r.key, score, reason: score < 6 ? 'bad zone' : 'ok' })) });
const roomGradeReply = (score: number) => JSON.stringify({ items: RUBRICS.room_stage.map((r) => ({ key: r.key, score, reason: 'ok' })) });

async function fabricInput(): Promise<FabricSwapInput> {
  return {
    kind: 'fabric_swap', brandId: 'b', templateName: 'T',
    templatePhoto: await solid(40, 50, [255, 0, 0]),
    zones: [{ id: 'top', display_name: 'Top', description: 'd', location: 'l', polygon_coords: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }] }],
    changes: [{ regionId: 'top', fabricName: 'F', weave: 'w', colorHex: '#000', category: 'c', swatch: await solid(8, 8, [0, 255, 0]) }],
  };
}

describe('runRenderJob fabric_swap', () => {
  it('walks every stage and returns done with a locked final image', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    const generate = vi.fn(async () => blue);
    const ask = vi.fn(async () => gradeReply(8));
    const stages: string[] = [];
    const out = await runRenderJob(job, { generate, ask, sleep: async () => undefined, onUpdate: (j) => stages.push(j.stage) });
    expect(out.status).toBe('done');
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND);
    expect(ask).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND);
    expect(out.result?.candidates).toHaveLength(3);
    expect(out.result?.chosenId).toBe(out.result?.candidates[0].id);
    expect(out.result?.prompt).toContain('Replace the Top');
    expect(stages).toEqual(expect.arrayContaining(['generate', 'grade', 'lock', 'store']));
    // seeds differ per candidate
    const seeds = generate.mock.calls.map((c: any) => c[0].seed);
    expect(new Set(seeds).size).toBe(3);
    // aspect ratio derived from the photo (40x50 -> 4:5)
    expect(generate.mock.calls[0][0].aspectRatio).toBe('4:5');
    // final image keeps the original's size
    expect(out.result?.finalImage.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('retries a retryable generate error then succeeds', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    let n = 0;
    const generate = vi.fn(async () => { if (n++ === 0) throw new RetryableError('429'); return blue; });
    const out = await runRenderJob(job, { generate, ask: async () => gradeReply(9), sleep: async () => undefined });
    expect(out.status).toBe('done');
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND + 1);
  });

  it('fails the job on a fatal error with its message', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const out = await runRenderJob(job, { generate: async () => { throw new FatalError('bad key', 'BAD_KEY'); }, ask: async () => gradeReply(9), sleep: async () => undefined });
    expect(out.status).toBe('failed');
    expect(out.error).toBe('bad key');
  });

  it('runs a second round with the grader reasons and ends needs_review when nothing passes', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    const generate = vi.fn(async () => blue);
    const ask = vi.fn(async () => gradeReply(4));
    const out = await runRenderJob(job, { generate, ask, sleep: async () => undefined });
    expect(out.status).toBe('needs_review');
    expect(out.round).toBe(MAX_ROUNDS);
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND * MAX_ROUNDS);
    const secondRoundPrompt = generate.mock.calls[CANDIDATES_PER_ROUND][0].prompt;
    expect(secondRoundPrompt).toContain('Previous attempt problems, avoid these: target_zones: bad zone');
    expect(out.result?.candidates).toHaveLength(6);
    expect(out.result?.finalImage).toBeTruthy(); // best candidate, locked
  });

  it('picks the highest passing total, not the first', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    let g = 0;
    const scores = [7, 9, 8];
    const out = await runRenderJob(job, { generate: async () => blue, ask: async () => gradeReply(scores[g++]), sleep: async () => undefined });
    expect(out.result?.chosenId).toBe(out.result?.candidates[1].id);
  });
});

describe('runRenderJob room_stage', () => {
  it('detects the window, prompts with it, and locks with the bbox mask', async () => {
    const store = new JobStore();
    const input: RoomStageInput = { kind: 'room_stage', brandId: 'b', roomPhoto: await solid(60, 40, [255, 0, 0]), curtainImage: await solid(10, 12, [0, 255, 0]) };
    const job = store.create(input, 'k');
    const generate = vi.fn(async () => solid(60, 40, [0, 0, 255]));
    const detectWindow = vi.fn(async () => ({ x: 25, y: 10, width: 50, height: 80 }));
    const out = await runRenderJob(job, { generate, ask: async () => roomGradeReply(8), detectWindow, sleep: async () => undefined });
    expect(out.status).toBe('done');
    expect(detectWindow).toHaveBeenCalledTimes(1);
    expect(generate.mock.calls[0][0].prompt).toContain('x 25-75%, y 10-90%');
    expect(generate.mock.calls[0][0].aspectRatio).toBe('3:2');
  });
  it('fails fatally when no window is found', async () => {
    const store = new JobStore();
    const input: RoomStageInput = { kind: 'room_stage', brandId: 'b', roomPhoto: await solid(60, 40, [255, 0, 0]), curtainImage: await solid(10, 12, [0, 255, 0]) };
    const job = store.create(input, 'k');
    const out = await runRenderJob(job, { generate: vi.fn(), ask: vi.fn(), detectWindow: async () => { throw new FatalError('no window', 'NO_WINDOW_DETECTED'); }, sleep: async () => undefined });
    expect(out.status).toBe('failed');
    expect(out.error).toBe('no window');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/runner.test.ts`
Expected: FAIL, cannot find module `./runner`.

- [ ] **Step 4: Write `runner.ts`**

```ts
// src/server/renderAgent/runner.ts
import type { Bbox, BuiltPrompt, Candidate, RenderJob } from './types';
import { generateImage, askVision, GenerateRequest, VisionRequest } from './imageClient';
import { detectWindow as defaultDetectWindow } from './windowDetect';
import { buildFabricSwapPrompt, buildRoomStagePrompt, closestAspectRatio } from './prompt';
import { buildGradePrompt, gradeImages, parseGrade, passes, total, reasonsBelowThreshold } from './grading';
import { getImageSize, polygonMaskPng, bboxMaskPng, lockOutsideMask } from './lock';
import { withRetry, FatalError } from './errors';

export const CANDIDATES_PER_ROUND = 3;
export const MAX_ROUNDS = 2;

export interface RunnerDeps {
  generate: (req: GenerateRequest) => Promise<string>;
  ask: (req: VisionRequest) => Promise<string>;
  detectWindow: (roomPhoto: string, apiKey: string | null) => Promise<Bbox>;
  sleep: (ms: number) => Promise<void>;
  onUpdate?: (job: RenderJob) => void;
}

const defaultDeps: RunnerDeps = {
  generate: (req) => generateImage(req),
  ask: (req) => askVision(req),
  detectWindow: (photo, key) => defaultDetectWindow(photo, key),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

export async function runRenderJob(job: RenderJob, partial: Partial<RunnerDeps> = {}): Promise<RenderJob> {
  const deps: RunnerDeps = { ...defaultDeps, ...partial };
  const update = (patch: Partial<RenderJob>) => { Object.assign(job, patch); deps.onUpdate?.(job); };
  const retry = <T>(fn: () => Promise<T>) => withRetry(fn, { sleep: deps.sleep });

  try {
    update({ status: 'running', stage: 'prompt' });

    // Inputs that do not change between rounds
    const original = job.input.kind === 'fabric_swap' ? job.input.templatePhoto : job.input.roomPhoto;
    const { width, height } = await getImageSize(original);
    const aspectRatio = closestAspectRatio(width, height);

    let windowBbox: Bbox | undefined;
    if (job.input.kind === 'room_stage') {
      windowBbox = await retry(() => deps.detectWindow(job.input.kind === 'room_stage' ? job.input.roomPhoto : '', job.apiKey));
    }

    const swatches = job.input.kind === 'fabric_swap' ? job.input.changes.map((c) => c.swatch) : [job.input.curtainImage];
    const gradeContext = job.input.kind === 'fabric_swap'
      ? { changes: job.input.changes.map((c) => ({ zoneName: job.input.kind === 'fabric_swap' ? job.input.zones.find((z) => z.id === c.regionId)?.display_name ?? c.regionId : '', fabricName: c.fabricName })) }
      : {};
    const gradePrompt = buildGradePrompt(job.kind, gradeContext).text;

    const mask = job.input.kind === 'fabric_swap'
      ? job.input.curtainMask ?? (await polygonMaskPng(job.input.zones, width, height))
      : await bboxMaskPng(windowBbox!, width, height);

    let previousProblems: string[] | undefined;
    let lastPrompt: BuiltPrompt | undefined;

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      update({ round, stage: 'prompt' });
      const prompt: BuiltPrompt = job.input.kind === 'fabric_swap'
        ? buildFabricSwapPrompt(job.input, previousProblems)
        : buildRoomStagePrompt(job.input, windowBbox!, previousProblems);
      lastPrompt = prompt;

      update({ stage: 'generate' });
      const images = await Promise.all(
        Array.from({ length: CANDIDATES_PER_ROUND }, (_, i) =>
          retry(() => deps.generate({ prompt: prompt.text, images: prompt.images, aspectRatio, seed: round * 100 + i + 1, apiKey: job.apiKey }))
        )
      );

      update({ stage: 'grade' });
      const graded: Candidate[] = await Promise.all(
        images.map(async (image, i) => {
          const scores = await retry(async () => parseGrade(await deps.ask({ prompt: gradePrompt, images: gradeImages(job.kind, original, swatches, image), apiKey: job.apiKey }), job.kind));
          return { id: `${job.id}-r${round}-c${i + 1}`, round, image, scores, total: total(scores), passed: passes(scores) };
        })
      );
      update({ candidates: [...job.candidates, ...graded] });

      const winner = graded.filter((c) => c.passed).sort((a, b) => b.total - a.total)[0];
      if (winner) {
        update({ stage: 'lock' });
        const finalImage = await lockOutsideMask(original, winner.image, mask);
        update({ stage: 'store', status: 'done', result: { finalImage, chosenId: winner.id, prompt: prompt.text, candidates: job.candidates } });
        return job;
      }
      const best = graded.slice().sort((a, b) => b.total - a.total)[0];
      previousProblems = reasonsBelowThreshold(best.scores);
    }

    // No round passed: hand the best candidate back for review, still locked.
    const best = job.candidates.slice().sort((a, b) => b.total - a.total)[0];
    update({ stage: 'lock' });
    const finalImage = await lockOutsideMask(original, best.image, mask);
    update({ stage: 'store', status: 'needs_review', result: { finalImage, chosenId: best.id, prompt: lastPrompt!.text, candidates: job.candidates } });
    return job;
  } catch (err: any) {
    const message = err instanceof FatalError ? err.message : `Render did not finish: ${err?.message || 'unknown error'}`;
    update({ status: 'failed', error: message });
    return job;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/runner.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/server/renderAgent/jobs.ts src/server/renderAgent/runner.ts src/server/renderAgent/runner.test.ts
git commit -m "feat(render-agent): job store and stage runner with grading rounds and lock"
```

---

### Task 9: HTTP routes, quota, and removal of the old endpoints

**Files:**
- Create: `src/server/renderAgent/routes.ts`
- Modify: `src/server/api.ts` (mount router; delete `/api/room-visualize` handler and the `single_region` branch of `/api/generate-curtain-fabric`)
- Modify: `src/server/openrouter.ts` (delete `callOpenRouterInpaint`, `callOpenRouterRoomViz` if unused after the api.ts edit; check with grep)
- Test: `src/server/renderAgent/routes.test.ts`

**Interfaces:**
- Consumes `jobStore`, `runRenderJob`, `RunnerDeps`, `getOrCreateBrandConfig`, `getEffectiveOpenRouterKey`.
- Produces `createRenderRouter(opts?: { store?: JobStore; deps?: Partial<RunnerDeps> }): express.Router` mounted at `/api/render`.

Request/response contract:

```
POST /api/render/jobs
  body: RenderJobInput (zod-validated; every image must be a raster data URL)
  202 { jobId }
  400 { error }            invalid body
  402 { error, code: 'QUOTA_EXCEEDED' }
  401 { error, code: 'BAD_KEY' }  no key resolves
GET /api/render/jobs/:id
  200 JobStore.publicView(job)
  404 { error }
```

- [ ] **Step 1: Write the failing test**

```ts
// src/server/renderAgent/routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import sharp from 'sharp';
import { createRenderRouter } from './routes';
import { JobStore } from './jobs';
import { RUBRICS } from './grading';
import { SERVER_MODEL_CONFIGS } from '../brandConfigs';

async function solid(w: number, h: number): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: 200, g: 10, b: 10 } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

let server: any; let base: string;
const store = new JobStore();
const grade = JSON.stringify({ items: RUBRICS.fabric_swap.map((r) => ({ key: r.key, score: 9, reason: 'ok' })) });

beforeAll(async () => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use('/api/render', createRenderRouter({ store, deps: { generate: async () => solid(40, 50), ask: async () => grade, sleep: async () => undefined } }));
  await new Promise<void>((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => server.close());

async function validBody() {
  return {
    kind: 'fabric_swap', brandId: 'brand-test', templateName: 'T', templatePhoto: await solid(40, 50),
    zones: [{ id: 'top', display_name: 'Top', description: 'd', location: 'l', polygon_coords: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }] }],
    changes: [{ regionId: 'top', fabricName: 'F', weave: 'w', colorHex: '#000', category: 'c', swatch: await solid(8, 8) }],
  };
}

describe('render routes', () => {
  it('accepts a job, then reports done via polling', async () => {
    const res = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(await validBody()) });
    expect(res.status).toBe(202);
    const { jobId } = await res.json();
    let body: any;
    for (let i = 0; i < 50; i++) {
      body = await (await fetch(`${base}/api/render/jobs/${jobId}`)).json();
      if (body.status === 'done' || body.status === 'failed') break;
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(body.status).toBe('done');
    expect(body.result.finalImage).toMatch(/^data:image\/png;base64,/);
    expect(body.apiKey).toBeUndefined();
    expect(body.input).toBeUndefined();
  });
  it('rejects a body with an svg swatch', async () => {
    const b = await validBody();
    b.changes[0].swatch = 'data:image/svg+xml;charset=utf-8,%3Csvg';
    const res = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(res.status).toBe(400);
  });
  it('increments the brand counter per job and refuses at the cap', async () => {
    SERVER_MODEL_CONFIGS.set('brand-capped', { id: 'c', brand_id: 'brand-capped', region_edit_provider: 'flux_kontext', room_preview_provider: 'nano_banana_pro', key_mode: 'platform_managed', monthly_generation_cap: 1, monthly_generations_used: 0, updated_at: '', updated_by_user_id: 'x' });
    const b = { ...(await validBody()), brandId: 'brand-capped' };
    const first = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(first.status).toBe(202);
    expect(SERVER_MODEL_CONFIGS.get('brand-capped')!.monthly_generations_used).toBe(1);
    const second = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(second.status).toBe(402);
    expect((await second.json()).code).toBe('QUOTA_EXCEEDED');
  });
  it('404s an unknown job', async () => {
    expect((await fetch(`${base}/api/render/jobs/nope`)).status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/renderAgent/routes.test.ts`
Expected: FAIL, cannot find module `./routes`.

- [ ] **Step 3: Write `routes.ts`**

```ts
// src/server/renderAgent/routes.ts
import express from 'express';
import { z } from 'zod';
import { jobStore as defaultStore, JobStore } from './jobs';
import { runRenderJob, RunnerDeps } from './runner';
import { getOrCreateBrandConfig } from '../brandConfigs';
import { getEffectiveOpenRouterKey } from '../openrouter';
import { parseBase64Image } from '../images';

const rasterDataUrl = z.string().refine((s) => parseBase64Image(s) !== null, 'must be a PNG, JPEG or WEBP data URL');
const point = z.object({ x: z.number(), y: z.number() });

const fabricSwapSchema = z.object({
  kind: z.literal('fabric_swap'),
  brandId: z.string().min(1),
  templateName: z.string().min(1),
  templatePhoto: rasterDataUrl,
  zones: z.array(z.object({ id: z.string(), display_name: z.string(), description: z.string(), location: z.string(), polygon_coords: z.array(point) })).min(1),
  changes: z.array(z.object({ regionId: z.string(), fabricName: z.string(), weave: z.string(), colorHex: z.string(), category: z.string(), swatch: rasterDataUrl })).min(1),
  curtainMask: rasterDataUrl.optional(),
});

const roomStageSchema = z.object({
  kind: z.literal('room_stage'),
  brandId: z.string().min(1),
  roomPhoto: rasterDataUrl,
  curtainImage: rasterDataUrl,
});

const inputSchema = z.discriminatedUnion('kind', [fabricSwapSchema, roomStageSchema]);

export function createRenderRouter(opts: { store?: JobStore; deps?: Partial<RunnerDeps> } = {}): express.Router {
  const store = opts.store ?? defaultStore;
  const router = express.Router();

  router.post('/jobs', (req, res) => {
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') });
    const input = parsed.data;

    const config = getOrCreateBrandConfig(input.brandId);
    const brandKey = config.key_mode === 'brand_byo_key' ? config.byo_api_key_encrypted : null;
    const apiKey = getEffectiveOpenRouterKey(brandKey);
    if (!apiKey && !process.env.GEMINI_API_KEY) return res.status(401).json({ error: 'No OpenRouter or Gemini key is configured. Add one in Settings.', code: 'BAD_KEY' });

    const cap = config.monthly_generation_cap ?? Infinity;
    const used = config.monthly_generations_used ?? 0;
    if (used >= cap) return res.status(402).json({ error: `This brand has used all ${cap} renders for the month.`, code: 'QUOTA_EXCEEDED' });
    config.monthly_generations_used = used + 1;

    const job = store.create(input, apiKey);
    void runRenderJob(job, opts.deps).finally(() => store.finish(job));
    res.status(202).json({ jobId: job.id });
  });

  router.get('/jobs/:id', (req, res) => {
    const job = store.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found or expired' });
    res.json(store.publicView(job));
  });

  return router;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/renderAgent/routes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Mount the router and remove the old endpoints in `api.ts`**

Add near the other imports:

```ts
import { createRenderRouter } from './renderAgent/routes';
```

After `apiApp.use(express.urlencoded(...))`:

```ts
apiApp.use('/api/render', createRenderRouter());
```

Delete the whole `apiApp.post('/api/room-visualize', ...)` handler (the block that begins with the `Room Visualization Endpoint (Section 8)` comment). Delete the `if (req.body.mode === 'single_region') { ... }` block inside `/api/generate-curtain-fabric`; keep the legacy multi-region body below it untouched.

Then run `grep -rn "callOpenRouterInpaint\|callOpenRouterRoomViz\|getRoomPreviewProvider\|ROOM_PREVIEW_MODEL_METADATA" src/server`. Remove the now-unused imports from `api.ts`. Leave `providers.ts` alone if any of its exports are still referenced by other routes (they are used by `/api/ai/edit-region` and the settings routes); only delete the two OpenRouter functions if nothing imports them.

- [ ] **Step 6: Type check and run the whole suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/server
git commit -m "feat(render-agent): job routes with validation and quota; remove one-shot room-visualize and single-region inpaint"
```

---

### Task 10: Client render helper and types

**Files:**
- Create: `src/lib/renderClient.ts`
- Modify: `src/types/curtain.ts:26-49` (add `curtain_mask_url?: string`)
- Modify: `src/types/brand.ts:50-79` (add candidate fields)
- Test: `src/lib/renderClient.test.ts`

**Interfaces:**
- Produces:

```ts
export interface RenderCandidateView { id: string; round: number; image: string; scores: Array<{ key: string; score: number; reason: string }>; total: number; passed: boolean }
export interface RenderJobView { id: string; kind: 'fabric_swap' | 'room_stage'; status: 'queued' | 'running' | 'done' | 'needs_review' | 'failed'; stage: 'prompt' | 'generate' | 'grade' | 'lock' | 'store'; round: number; candidates: RenderCandidateView[]; result?: { finalImage: string; chosenId: string; prompt: string; candidates: RenderCandidateView[] }; error?: string }
export const STAGE_COPY: Record<RenderJobView['stage'], string>;
export function toDataUrl(src: string): Promise<string>;                         // browser only
export function buildFabricSwapInput(template, assignments, fabrics, brandId): Promise<FabricSwapBody>;  // browser only
export async function startRender(body: object, fetchImpl = fetch): Promise<string>;   // returns jobId; throws Error with .code
export async function pollRender(jobId: string, onUpdate: (j: RenderJobView) => void, opts?: { fetchImpl?: typeof fetch; intervalMs?: number; sleep?: (ms) => Promise<void> }): Promise<RenderJobView>;
```

- [ ] **Step 1: Add the type fields**

In `src/types/curtain.ts`, inside `CurtainTemplate` after `plate_id?: string;`:

```ts
  curtain_mask_url?: string; // optional feathered mask (white = curtain); derived from zone polygons when absent
```

In `src/types/brand.ts`, add before `export interface Design`:

```ts
export interface RenderCandidate {
  id: string;
  round: number;
  image: string;
  scores: Array<{ key: string; score: number; reason: string }>;
  total: number;
  passed: boolean;
}
```

Inside `RoomPreview` add `candidates?: RenderCandidate[];`. Inside `Design` after `render_kind` add:

```ts
  render_candidates?: RenderCandidate[];
  render_prompt?: string;
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/renderClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { startRender, pollRender, STAGE_COPY } from './renderClient';

const json = (status: number, body: any) => ({ ok: status < 400, status, json: async () => body }) as any;

describe('startRender', () => {
  it('returns the job id', async () => {
    const f = vi.fn(async () => json(202, { jobId: 'job-1' }));
    await expect(startRender({ kind: 'fabric_swap' }, f)).resolves.toBe('job-1');
    expect(f.mock.calls[0][0]).toBe('/api/render/jobs');
  });
  it('throws with the server message and code', async () => {
    const f = vi.fn(async () => json(402, { error: 'cap', code: 'QUOTA_EXCEEDED' }));
    const err = await startRender({}, f).catch((e) => e);
    expect(err.message).toBe('cap');
    expect(err.code).toBe('QUOTA_EXCEEDED');
  });
});

describe('pollRender', () => {
  it('reports each update and resolves on a terminal status', async () => {
    const states = [
      { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'generate', round: 1, candidates: [] },
      { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'grade', round: 1, candidates: [] },
      { id: 'j', kind: 'fabric_swap', status: 'done', stage: 'store', round: 1, candidates: [], result: { finalImage: 'x', chosenId: 'c', prompt: 'p', candidates: [] } },
    ];
    let i = 0;
    const f = vi.fn(async () => json(200, states[i++]));
    const seen: string[] = [];
    const sleep = vi.fn(async () => undefined);
    const out = await pollRender('j', (j) => seen.push(j.stage), { fetchImpl: f, intervalMs: 2000, sleep });
    expect(out.status).toBe('done');
    expect(seen).toEqual(['generate', 'grade', 'store']);
    expect(sleep).toHaveBeenCalledWith(2000);
  });
  it('rejects when the job disappears', async () => {
    const f = vi.fn(async () => json(404, { error: 'gone' }));
    await expect(pollRender('j', () => undefined, { fetchImpl: f, sleep: async () => undefined })).rejects.toThrow('gone');
  });
  it('has copy for every stage', () => {
    expect(STAGE_COPY.generate).toBe('Generating 3 options');
    expect(STAGE_COPY.grade).toBe('Checking quality');
    expect(STAGE_COPY.lock).toBe('Locking background');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/renderClient.test.ts`
Expected: FAIL, cannot find module `./renderClient`.

- [ ] **Step 4: Write `renderClient.ts`**

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/renderClient.test.ts && npx tsc --noEmit`
Expected: PASS (5 tests), no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/renderClient.ts src/lib/renderClient.test.ts src/types/curtain.ts src/types/brand.ts
git commit -m "feat(client): render job client, stage copy, and candidate fields on Design"
```

---

### Task 11: Template editor uses the render job

**Files:**
- Modify: `src/components/brand/TemplateEditor.tsx`
- Modify: `src/utils/fabricRenderer.ts:7-19`
- Delete: `src/utils/maskedPipeline.ts`
- Modify: `src/components/brand/BrandDashboard.tsx:108`

**Interfaces:**
- Consumes `buildFabricSwapInput`, `startRender`, `pollRender`, `STAGE_COPY`, `RenderJobView` from `../../lib/renderClient`.

- [ ] **Step 1: Make the real photo the base of the sketch**

Replace `getTemplateRealPhotoUrl` in `src/utils/fabricRenderer.ts` with:

```ts
export function getTemplateRealPhotoUrl(template: CurtainTemplate, width = 800, height = 1000): string {
  if (template.real_photo_url) return template.real_photo_url;
  if (template.original_image_url) return template.original_image_url;
  if (template.plate_id) return generateRealisticPlate(template.plate_id, width, height);
  return generateRealisticPlate('default', width, height);
}
```

Check `loadImage` (line 24) handles a relative `/templates/x.png` path: it sets `crossOrigin` only for http(s), and relative same-origin paths load fine. No change needed.

- [ ] **Step 2: Delete the masked pipeline**

Run: `git rm src/utils/maskedPipeline.ts`

- [ ] **Step 3: Rewrite the render flow in `TemplateEditor.tsx`**

Replace the import line 9 with:

```ts
import { buildFabricSwapInput, startRender, pollRender, STAGE_COPY, RenderJobView } from '../../lib/renderClient';
```

Replace the state declarations at lines 31-33 with:

```ts
  const [renderJob, setRenderJob] = useState<RenderJobView | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [chosenCandidateId, setChosenCandidateId] = useState<string | null>(null);
```

Replace `handlePhotoreal` (lines 109-138) with:

```ts
  const handleRender = async () => {
    if (!currentTemplate) return;
    if (assignments.length === 0) { setStatus({ kind: 'info', text: 'Choose a fabric for at least one zone before rendering.' }); return; }
    setIsGenerating(true);
    setStatus(null);
    setGeneratedImageUrl(null);
    setRenderJob(null);
    try {
      const body = await buildFabricSwapInput(currentTemplate, assignments, scopedFabrics, currentBrandId);
      const jobId = await startRender(body);
      const job = await pollRender(jobId, setRenderJob);
      if (job.status === 'failed') {
        setStatus({ kind: 'info', text: job.error || 'The render did not finish.' });
      } else if (job.result) {
        setGeneratedImageUrl(job.result.finalImage);
        setChosenCandidateId(job.result.chosenId);
        setStatus(job.status === 'needs_review'
          ? { kind: 'info', text: 'No option passed the quality check. Showing the best one; accept it or rerun.' }
          : { kind: 'ok', text: 'Render ready. Save the design to keep it.' });
      }
    } catch (err: any) {
      setStatus({ kind: 'info', text: err.message || 'The render did not finish.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const chooseCandidate = (id: string) => {
    const c = renderJob?.result?.candidates.find((x) => x.id === id);
    if (!c) return;
    setChosenCandidateId(id);
    setGeneratedImageUrl(c.image);
  };
```

Note: choosing a runner-up shows its unlocked image; the locked final only exists for the grader's pick. That matches the spec's "clicking one makes it the final" at the cost of the background lock for manual picks, and is called out in the status line below.

In `handleConfirmSave`, extend the `saveDesign` call with:

```ts
      render_candidates: renderJob?.result?.candidates,
      render_prompt: renderJob?.result?.prompt,
```

Replace the stage badge block (lines 302-309) with:

```tsx
            <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
              <span className="badge badge-muted" title={generatedImageUrl ? 'Made by the AI model from your fabrics and checked for quality. This is what clients see.' : 'Instant sketch drawn by the studio. Press Render for the client-ready image.'}>
                {generatedImageUrl ? (renderJob?.status === 'needs_review' ? 'Rendered · needs review' : 'Rendered') : 'Sketch'}
              </span>
              <button type="button" className="compact-only rounded-[8px] bg-[var(--color-bg-surface)] px-3 py-1.5 text-[12px] font-semibold shadow-[var(--shadow-ring)]" onClick={() => setIsPickerSheetOpen(true)}>
                {activeRegion ? `Fabric for ${activeRegion.display_name}` : 'Choose a fabric'}
              </button>
            </div>
            {isGenerating && renderJob && (
              <div className="absolute top-3 left-3 rounded-[10px] bg-[var(--color-bg-surface)]/90 px-3 py-2 text-[12px] font-semibold shadow-[var(--shadow-ring)]">
                {STAGE_COPY[renderJob.stage]}{renderJob.round > 1 ? ` · round ${renderJob.round}` : ''}
              </div>
            )}
```

Dim the sketch while the render runs: change the `<canvas ... className=` at line 275 to include `${isGenerating ? 'opacity-60' : ''}`.

Below the `</section>` that closes the stage (after line 311), add the candidate strip:

```tsx
          {renderJob?.result && renderJob.result.candidates.length > 1 && (
            <div className="col-span-full flex items-center gap-2 overflow-x-auto px-1 lg:col-start-2 lg:col-end-3">
              {renderJob.result.candidates.map((c) => (
                <button key={c.id} type="button" onClick={() => chooseCandidate(c.id)} title={c.scores.map((s) => `${s.key}: ${s.score} — ${s.reason}`).join('\n')} className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[10px] border-2 ${chosenCandidateId === c.id ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={c.image} alt="" className="h-full w-full object-cover" />
                  <span className={`absolute right-1 bottom-1 rounded-full px-1.5 text-[10px] font-semibold text-white ${c.passed ? 'bg-[#1F6B48]' : 'bg-[#6B5420]'}`}>{c.total}</span>
                </button>
              ))}
            </div>
          )}
```

Replace the action bar render button (lines 336-339) with:

```tsx
          <button type="button" disabled={isGenerating} onClick={handleRender} className="btn btn-secondary flex-col items-start gap-0 py-1" style={{ height: 'auto', minHeight: 40 }}>
            <span className="flex items-center gap-2"><Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />{isGenerating ? (renderJob ? STAGE_COPY[renderJob.stage] : 'Starting…') : renderJob?.status === 'needs_review' ? 'Rerun render' : 'Render'}</span>
            <span className="studio-action-note">Uses 1 monthly render · about a minute</span>
          </button>
```

Remove the now-unused `generationStepText` references (search the file for `generationStepText` and delete every line that mentions it).

- [ ] **Step 4: Update the dashboard badge**

In `src/components/brand/BrandDashboard.tsx` line 108 change `'Live preview'` to `'Sketch'` and `'Photoreal render'` to `'Rendered'`.

- [ ] **Step 5: Type check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: no errors. If tsc reports `generateSequentialRedesign` still imported in `DesignDetailView.tsx`, that is expected until Task 12; temporarily proceed to Task 12 before committing only if the build fails on that import.

- [ ] **Step 6: Commit**

```bash
git add src/utils/fabricRenderer.ts src/components/brand/TemplateEditor.tsx src/components/brand/BrandDashboard.tsx
git rm -q src/utils/maskedPipeline.ts 2>/dev/null || true
git commit -m "feat(studio): sketch plus graded render job with candidate strip; real photo as sketch base"
```

---

### Task 12: Design detail renders and stages through jobs

**Files:**
- Modify: `src/components/brand/DesignDetailView.tsx`

**Interfaces:**
- Consumes `buildFabricSwapInput`, `startRender`, `pollRender`, `STAGE_COPY`, `RenderJobView` from `../../lib/renderClient`.

- [ ] **Step 1: Replace the import and state**

Replace line 10 with:

```ts
import { buildFabricSwapInput, startRender, pollRender, STAGE_COPY, RenderJobView } from '../../lib/renderClient';
```

Replace lines 31-33 with:

```ts
  const [isStaging, setIsStaging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [activeJob, setActiveJob] = useState<RenderJobView | null>(null);
  const [reviewStage, setReviewStage] = useState<{ source: RoomSource; photo: string; job: RenderJobView } | null>(null);
```

- [ ] **Step 2: Replace `handlePhotoreal`**

```ts
  const handlePhotoreal = async () => {
    if (!template) return;
    setIsRendering(true);
    setError(null);
    setActiveJob(null);
    try {
      const body = await buildFabricSwapInput(template, design.assignments, fabrics, currentBrandId);
      const job = await pollRender(await startRender(body), setActiveJob);
      if (job.status === 'failed') throw new Error(job.error || 'Render did not finish');
      if (job.result) updateDesign(design.id, { final_image_url: job.result.finalImage, render_kind: 'photoreal', render_candidates: job.result.candidates, render_prompt: job.result.prompt });
      if (job.status === 'needs_review') setError('No render option passed the quality check. The best one was kept; rerun if it is not right.');
    } catch (err: any) {
      setError(`Render did not finish: ${err.message || 'unknown error'}.`);
    } finally {
      setIsRendering(false);
      setActiveJob(null);
    }
  };
```

- [ ] **Step 3: Replace `handleStage`**

```ts
  const handleStage = async () => {
    if (!pendingRoom) return;
    const { source, photo } = pendingRoom;
    setIsStaging(true);
    setError(null);
    setPendingRoom(null);
    setActiveJob(null);
    try {
      const body = { kind: 'room_stage' as const, brandId: currentBrandId, roomPhoto: await toDataUrl(photo), curtainImage: await toDataUrl(design.final_image_url) };
      const job = await pollRender(await startRender(body), setActiveJob);
      if (job.status === 'failed' || !job.result) throw new Error(job.error || 'Room staging failed');
      if (job.status === 'needs_review') { setReviewStage({ source, photo, job }); return; }
      addRoomPreview(design.id, { design_id: design.id, brand_id: currentBrandId, room_source: source, room_photo_url: photo, output_url: job.result.finalImage, provider_used: 'render_agent', candidates: job.result.candidates });
      setSelectedPreviewIndex(roomPreviews.length);
      setTimeout(() => scrollTo('design-room'), 50);
    } catch (err: any) {
      setError(err.message || 'Room staging failed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsStaging(false);
      setActiveJob(null);
    }
  };

  const acceptReviewStage = () => {
    if (!reviewStage) return;
    const { source, photo, job } = reviewStage;
    addRoomPreview(design.id, { design_id: design.id, brand_id: currentBrandId, room_source: source, room_photo_url: photo, output_url: job.result!.finalImage, provider_used: 'render_agent', candidates: job.result!.candidates });
    setSelectedPreviewIndex(roomPreviews.length);
    setReviewStage(null);
  };
```

Add `toDataUrl` to the import from `renderClient`.

- [ ] **Step 4: Update the copy and the staging panel**

Line 182 lede: change `'This is the studio preview. Create a photoreal render for the client-ready image.'` to `'This is the studio sketch. Render it for the client-ready image.'` and `'Photoreal render made from your fabric choices.'` to `'Rendered from your fabric choices and checked for quality.'`.

Line 186 badge: `{design.render_kind === 'photoreal' ? 'Rendered' : 'Sketch'}`.

Line 207 button label: replace `{isRendering ? renderStep || 'Rendering…' : 'Create photoreal render'}` with `{isRendering ? (activeJob ? STAGE_COPY[activeJob.stage] : 'Starting…') : 'Render'}`.

Line 210 note: `Uses 1 monthly render · about a minute.`

Lines 223-224 (staging shimmer copy): replace with

```tsx
            <p className="z-10 mt-3 text-[13px] font-semibold">{activeJob ? STAGE_COPY[activeJob.stage] : 'Starting…'}</p>
            <p className="z-10 text-[12px] text-[var(--color-text-secondary)]">Finding the window, trying 3 options, checking each. About a minute.</p>
```

Line 240 badge: `With your curtain` (drop the provider label).

Line 327 note: `Uses 1 monthly render.`

Add the review dialog right before the closing `</div>` of the component (after the `pendingRoom` dialog):

```tsx
      {reviewStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm">
          <div role="dialog" aria-label="Review staging" className="brand-card w-full max-w-2xl space-y-4 p-5">
            <div>
              <p className="eyebrow-label">Needs review</p>
              <h3 className="mt-0.5 font-display text-[18px] font-semibold">No staging option passed the quality check</h3>
              <p className="text-[13px] text-[var(--color-text-secondary)]">This is the best of {reviewStage.job.result!.candidates.length}. Keep it, or try again.</p>
            </div>
            <div className="media-frame aspect-[16/10] rounded-[14px]"><img src={reviewStage.job.result!.finalImage} alt="Best staging option" className="h-full w-full object-cover" /></div>
            <ul className="space-y-1 text-[12px] text-[var(--color-text-secondary)]">
              {reviewStage.job.result!.candidates.find((c) => c.id === reviewStage.job.result!.chosenId)?.scores.filter((s) => s.score < 6).map((s) => <li key={s.key}>{s.key.replace(/_/g, ' ')}: {s.reason}</li>)}
            </ul>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => { const r = reviewStage; setReviewStage(null); setPendingRoom({ source: r.source, photo: r.photo }); }} className="btn btn-ghost">Rerun</button>
              <button type="button" onClick={acceptReviewStage} className="btn btn-primary">Accept</button>
            </div>
          </div>
        </div>
      )}
```

Remove the `renderStep` state and every reference to it, and the `providerLabel` import if it is now unused.

- [ ] **Step 5: Type check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/brand/DesignDetailView.tsx
git commit -m "feat(design): render and stage through the graded job; review dialog for failed staging"
```

---

### Task 13: Template creation guard and zone descriptions

**Files:**
- Modify: `src/components/NewTemplateModal.tsx:330-345` (upload handler) and the refine step's region list

- [ ] **Step 1: Add the width guard to `handleImageFile`**

Replace the `reader.onload` body with:

```ts
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      const probe = new Image();
      probe.onload = () => {
        if (probe.naturalWidth < 1000) {
          setErrorMessage(`This photo is ${probe.naturalWidth} px wide. Renders need at least 1000 px; 1500 px or more gives the best result.`);
          return;
        }
        if (probe.naturalWidth < 1500) {
          setErrorMessage(`This photo is ${probe.naturalWidth} px wide. Renders look best from 1500 px or wider, but you can continue.`);
        } else {
          setErrorMessage(null);
        }
        setUploadedImage(b64);
        setTemplateName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        analyzeCurtainImage(b64);
      };
      probe.src = b64;
    };
```

`analyzeCurtainImage` sets `errorMessage` to null on entry; move that `setErrorMessage(null)` call out of `analyzeCurtainImage` so the soft warning survives (delete the line `setErrorMessage(null);` at the top of `analyzeCurtainImage`).

- [ ] **Step 2: Add an editable description per zone in the refine step**

Find the refine-step list where each of `detectedRegions` is rendered (search for `detectedRegions.map(`). Inside each region row, after the element showing `display_name`, add:

```tsx
                  <label className="mt-1 block">
                    <span className="field-label text-[11px]">What this zone is, in plain words</span>
                    <input
                      type="text"
                      className="field h-8 text-[12px]"
                      value={region.description}
                      placeholder="e.g. top pleated band, roughly the upper 60%"
                      onChange={(e) => setDetectedRegions((prev) => prev.map((r) => (r.id === region.id ? { ...r, description: e.target.value } : r)))}
                    />
                  </label>
```

If the map variable is not named `region`, use the name in scope.

- [ ] **Step 3: Type check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/NewTemplateModal.tsx
git commit -m "feat(templates): photo width guard and editable zone descriptions"
```

---

### Task 14: Env documentation and full verification

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update `.env.example`**

Replace the "Recommended OpenRouter Model Overrides" block with:

```
# 2. Model overrides (optional — defaults are built in)
# Image generation for renders and room staging (default: google/gemini-3-pro-image)
# OPENROUTER_ROOM_VIZ_MODEL=google/gemini-3-pro-image

# Vision model for zone analysis, window detection and render grading (default: google/gemini-2.5-flash)
# OPENROUTER_VISION_MODEL=google/gemini-2.5-flash
```

Remove the `OPENROUTER_INPAINT_MODEL` lines.

- [ ] **Step 2: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npx vite build`
Expected: all green. Paste the vitest summary line into the commit body.

- [ ] **Step 3: Manual acceptance against the real provider**

1. Put a valid `OPENROUTER_API_KEY` in `.env`.
2. `npm run dev`, open `http://localhost:3000`.
3. Library → add a curtain style from the Gemini session's color-blocked curtain photo (at least 1500 px wide). Confirm the zones and their descriptions.
4. Studio → assign the denim floral swatch to the top zone → **Render**. Expect the stage copy to walk through "Generating 3 options", "Checking quality", "Locking background" in about a minute.
5. Compare the result with the Gemini output side by side. The bar: a staff member would show it to a client.
6. Save → design page → Stage in the living-room photo. Expect the slider only after success, and the review dialog if grading fails twice.
7. Record what you saw (scores, rounds, wall time) in the commit message of Step 4.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "docs(env): document live model env vars for the render agent

Manual acceptance: <fill in scores, rounds, time observed>"
```

---

## Self-review notes

- Spec §3 Stage 0: zone descriptions (Task 13), width guard (Task 13). `curtain_mask_url` is optional on the type (Task 10) and honoured by the runner (Task 8); the plan derives the mask from polygons on the server instead of computing it in the browser at template creation, which is a simplification of the spec's Stage 0 with the same result.
- Spec §3 Stages 1-6: Tasks 3, 6, 8, 4, 5, 8/10.
- Spec §4 API: Task 9. Spec §5 models: Task 6 constants, Task 14 env. Spec §6 errors: Tasks 2, 6, 7, 8. Spec §7 UI: Tasks 11, 12, 13. Spec §8 tests: unit in Tasks 1-7 and 10, stage tests in Tasks 8-9, acceptance in Task 14.
- Spec §9 open items: `sharp` chosen (Task 5); OpenRouter `/images` supports `seed`, `n`, `resolution`, and object-shaped `input_references` (Task 6); grader receives original + up to N swatches + candidate in one chat request (Task 4/6).
- Names used consistently: `runRenderJob`, `JobStore`, `generateImage`, `askVision`, `detectWindow`, `buildFabricSwapPrompt`, `buildRoomStagePrompt`, `buildGradePrompt`, `parseGrade`, `passes`, `lockOutsideMask`, `polygonMaskPng`, `bboxMaskPng`, `startRender`, `pollRender`, `buildFabricSwapInput`, `toDataUrl`, `STAGE_COPY`.
