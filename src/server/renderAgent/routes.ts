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
